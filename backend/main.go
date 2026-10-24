// Package main — точка входа HTTP-сервера «Семейный банкинг для М-Беларусбанка».
//
// MVP-функция: перевод карманных денег от родителя к ребёнку.
// Данные хранятся in-memory (структура familyService), база данных
// будет подключена на следующем этапе.
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

// FamilyState — ответ эндпоинта GET /api/family/state:
// текущие балансы родителя и ребёнка + список задач (To-Do).
type FamilyState struct {
	ParentBalance float64  `json:"parentBalance"`
	ChildBalance  float64  `json:"childBalance"`
	Tasks         []string `json:"tasks"`
}

// transferRequest — тело запроса POST /api/family/transfer.
type transferRequest struct {
	Amount float64 `json:"amount"`
}

// transferResponse — ответ эндпоинта POST /api/family/transfer:
// обновлённые балансы и сообщение для пользователя.
type transferResponse struct {
	ParentBalance float64 `json:"parentBalance"`
	ChildBalance  float64 `json:"childBalance"`
	Message       string  `json:"message"`
}

// familyService — in-memory хранилище семейных данных.
// Mutex защищает балансы от гонок: на фронтенде пользователь может
// нажать «Перевести» несколько раз, и запросы уйдут параллельно.
type familyService struct {
	mu            sync.Mutex
	ParentBalance float64
	ChildBalance  float64
	Tasks         []string
}

// newFamilyService — стартовое состояние семьи для демонстрации MVP:
// у родителя 100.00, у ребёнка 20.00, в списке пара учебных задач.
func newFamilyService() *familyService {
	return &familyService{
		ParentBalance: 100.00,
		ChildBalance:  20.00,
		Tasks: []string{
			"Собрать портфель к школе",
			"Помыть посуду после ужина",
		},
	}
}

// buildState возвращает текущее состояние семьи (копию данных под блокировкой).
func (s *familyService) buildState() FamilyState {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Копируем слайс задач, чтобы вызывающий код не мог
	// мутировать внутреннее состояние сервиса по ссылке.
	tasksCopy := make([]string, len(s.Tasks))
	copy(tasksCopy, s.Tasks)

	return FamilyState{
		ParentBalance: s.ParentBalance,
		ChildBalance:  s.ChildBalance,
		Tasks:         tasksCopy,
	}
}

// transfer переводит amount денег от родителя к ребёнку,
// возвращает обновлённые балансы и сообщение для пользователя.
func (s *familyService) transfer(amount float64) (transferResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if amount <= 0 {
		return transferResponse{}, errInvalidAmount
	}
	if amount > s.ParentBalance {
		return transferResponse{}, errInsufficientFunds
	}

	s.ParentBalance -= amount
	s.ChildBalance += amount

	return transferResponse{
		ParentBalance: s.ParentBalance,
		ChildBalance:  s.ChildBalance,
		Message:       "Перевод выполнен успешно",
	}, nil
}

// Доменные ошибки: каждая несёт свой HTTP-статус, чтобы
// маппить их на корректный ответ клиенту.
var (
	errInvalidAmount     = errDomain{code: http.StatusBadRequest, message: "Сумма перевода должна быть больше нуля"}
	errInsufficientFunds = errDomain{code: http.StatusUnprocessableEntity, message: "Недостаточно средств на счёте родителя"}
	errInvalidJSON       = errDomain{code: http.StatusBadRequest, message: "Некорректный JSON в теле запроса"}
)

// errDomain — ошибка приложения с HTTP-статусом для ответа клиенту.
type errDomain struct {
	code    int
	message string
}

// Error реализует интерфейс error.
func (e errDomain) Error() string { return e.message }

// apiHandler — обработчики семейных эндпоинтов.
type apiHandler struct {
	family *familyService
}

// handleState обрабатывает GET /api/family/state — текущее состояние семьи.
func (h *apiHandler) handleState(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.family.buildState())
}

// handleTransfer обрабатывает POST /api/family/transfer — перевод денег.
func (h *apiHandler) handleTransfer(w http.ResponseWriter, r *http.Request) {
	// Ограничиваем размер тела, чтобы защитить сервер от очень больших запросов.
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 МБ

	var req transferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, errInvalidJSON) // Decode сам закрывает Body
		return
	}

	resp, err := h.family.transfer(req.Amount)
	if err != nil {
		// Известные доменные ошибки отдают свой статус (400/422),
		// любые непредвиденные — 500, но всегда в формате JSON.
		switch e := err.(type) {
		case errDomain:
			writeError(w, e)
		default:
			writeError(w, errDomain{
				code:    http.StatusInternalServerError,
				message: "Внутренняя ошибка сервера",
			})
		}
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// writeError пишет доменную ошибку клиенту в формате {"error": "..."}.
func writeError(w http.ResponseWriter, err errDomain) {
	writeJSON(w, err.code, map[string]string{"error": err.message})
}

// writeJSON сериализует payload в JSON и пишет его в ответ.
func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("writeJSON: не удалось записать ответ: %v", err)
	}
}

// withCORS — middleware, разрешающий запросы с Vue-фронтенда.
// Разрешены два источника: dev-сервер на localhost:5173
// и телефон в локальной сети (npm run dev -- --host, LAN IP машины).
// Новые источники добавляются в список ниже.
func withCORS(next http.Handler) http.Handler {
	allowedOrigins := map[string]bool{
		"http://localhost:5173":     true,
		"http://192.168.0.106:5173": true, // телефон в той же Wi-Fi сети
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// Отвечаем на preflight только для разрешённых источников.
		if origin != "" && allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Set("Access-Control-Max-Age", "86400")
		}

		// Браузер шлёт preflight OPTIONS перед POST с Content-Type: application/json —
		// отвечаем 204, не доходя до бизнес-логики.
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// newRouter собирает маршруты приложения.
// Методы задаются прямо в паттерне (Go 1.22+): неверный метод
// для зарегистрированного пути получит 405 автоматически.
func newRouter(h *apiHandler) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/family/state", h.handleState)
	mux.HandleFunc("POST /api/family/transfer", h.handleTransfer)

	return withCORS(mux)
}

func main() {
	family := newFamilyService()
	handler := newRouter(&apiHandler{family: family})

	addr := ":8080"
	log.Printf("Семейный банкинг слушает %s (CORS: http://localhost:5173)", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("сервер завершился с ошибкой: %v", err)
	}
}
