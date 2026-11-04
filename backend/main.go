package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"
)

// ─── СТРУКТУРЫ ДАННЫХ ───

type Card struct {
	ID            int     `json:"id"`
	Title         string  `json:"title"`
	Subtitle      string  `json:"subtitle"`
	Balance       float64 `json:"balance"`
	Design        string  `json:"design"`
	MaskedNumber  string  `json:"maskedNumber"`
	IsActive      bool    `json:"isActive"`
	PaymentSystem string  `json:"paymentSystem"`
}

type Child struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Age      int     `json:"age"`
	Initials string  `json:"initials"`
	AgeGroup string  `json:"ageGroup"`
	Balance  float64 `json:"balance"`
}

type MoneyRequest struct {
	ID     string  `json:"id"`
	Amount float64 `json:"amount"`
	Reason string  `json:"reason"`
	Status string  `json:"status"`
}

type StateResponse struct {
	ParentBalance float64 `json:"parentBalance"`
	ChildBalance  float64 `json:"childBalance"`
	Cards         []Card  `json:"cards"`
	Children      []Child `json:"children"`
}

// ─── СЕРВИС ───

type familyService struct {
	mu            sync.Mutex
	ParentBalance float64
	ChildBalance  float64
	Cards         []Card
	Children      []Child
	Requests      []MoneyRequest
}

func newFamilyService() *familyService {
	return &familyService{
		ParentBalance: 2000.00,
		ChildBalance:  30.00,
		Cards: []Card{
			{ID: 1, Title: "Карта 1", Subtitle: "Экономный по 22.11.2026", Balance: 2000.00, Design: "emerald", MaskedNumber: "**** **** **** 9883", IsActive: true, PaymentSystem: "VISA"},
		},
		Children: []Child{
			{ID: "child-1", Name: "Миша", Age: 10, Initials: "МП", AgeGroup: "7-13", Balance: 30.00},
		},
		Requests: []MoneyRequest{},
	}
}

func (s *familyService) buildState() StateResponse {
	s.mu.Lock()
	defer s.mu.Unlock()
	return StateResponse{
		ParentBalance: s.ParentBalance,
		ChildBalance:  s.ChildBalance,
		Cards:         s.Cards,
		Children:      s.Children,
	}
}

// ─── ОБРАБОТЧИКИ ───

type apiHandler struct {
	family *familyService
}

func (h *apiHandler) handleState(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.family.buildState())
}

func (h *apiHandler) handleAddCard(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Design string `json:"design"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	h.family.mu.Lock()
	newID := len(h.family.Cards) + 1
	newCard := Card{
		ID: newID, Title: fmt.Sprintf("Карта %d", newID), Subtitle: "Новая карта",
		Balance: 0, Design: req.Design, MaskedNumber: "**** **** **** 1111",
		IsActive: true, PaymentSystem: "VISA",
	}
	h.family.Cards = append(h.family.Cards, newCard)
	h.family.mu.Unlock()

	writeJSON(w, http.StatusOK, newCard)
}

func (h *apiHandler) handleAddChild(w http.ResponseWriter, r *http.Request) {
	var req Child
	json.NewDecoder(r.Body).Decode(&req)

	h.family.mu.Lock()
	req.ID = fmt.Sprintf("child-%d", len(h.family.Children)+1)
	req.Balance = 0
	h.family.Children = append(h.family.Children, req)
	h.family.mu.Unlock()

	writeJSON(w, http.StatusOK, req)
}

func (h *apiHandler) handleTransfer(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Amount float64 `json:"amount"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	h.family.mu.Lock()
	defer h.family.mu.Unlock()

	if req.Amount <= 0 {
		http.Error(w, `{"error": "Сумма должна быть больше нуля"}`, http.StatusBadRequest)
		return
	}
	if req.Amount > h.family.ParentBalance {
		http.Error(w, `{"error": "Недостаточно средств"}`, http.StatusUnprocessableEntity)
		return
	}

	h.family.ParentBalance -= req.Amount
	h.family.ChildBalance += req.Amount

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"parentBalance": h.family.ParentBalance,
		"childBalance":  h.family.ChildBalance,
		"message":       "Перевод выполнен успешно",
	})
}

func checkAuth(r *http.Request, requiredRole string) bool {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return false
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")
	if requiredRole == "child" && token == "child-token" {
		return true
	}
	if requiredRole == "parent" && token == "parent-token" {
		return true
	}
	return false
}

func (h *apiHandler) handleCreateRequest(w http.ResponseWriter, r *http.Request) {
	if !checkAuth(r, "child") {
		http.Error(w, `{"error": "Доступ запрещен. Нужен токен ребенка"}`, http.StatusUnauthorized)
		return
	}

	var req struct {
		Amount float64 `json:"amount"`
		Reason string  `json:"reason"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	h.family.mu.Lock()
	newReq := MoneyRequest{
		ID:     fmt.Sprintf("%d", time.Now().Unix()),
		Amount: req.Amount,
		Reason: req.Reason,
		Status: "pending",
	}
	h.family.Requests = append(h.family.Requests, newReq)
	h.family.mu.Unlock()

	writeJSON(w, http.StatusOK, newReq)
}

func (h *apiHandler) handleApproveRequest(w http.ResponseWriter, r *http.Request) {
	if !checkAuth(r, "parent") {
		http.Error(w, `{"error": "Доступ запрещен. Нужен токен родителя"}`, http.StatusForbidden)
		return
	}

	h.family.mu.Lock()
	defer h.family.mu.Unlock()

	if len(h.family.Requests) == 0 {
		http.Error(w, `{"error": "Нет активных запросов"}`, http.StatusNotFound)
		return
	}

	lastIdx := len(h.family.Requests) - 1
	req := &h.family.Requests[lastIdx]
	req.Status = "approved"
	h.family.ChildBalance += req.Amount

	writeJSON(w, http.StatusOK, req)
}

func writeJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func newRouter(h *apiHandler) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/family/state", h.handleState)
	mux.HandleFunc("POST /api/family/transfer", h.handleTransfer)
	mux.HandleFunc("POST /api/family/card", h.handleAddCard)
	mux.HandleFunc("POST /api/family/child", h.handleAddChild)
	mux.HandleFunc("POST /api/family/request", h.handleCreateRequest)
	mux.HandleFunc("POST /api/family/request/approve", h.handleApproveRequest)
	return withCORS(mux)
}

func main() {
	family := newFamilyService()
	handler := newRouter(&apiHandler{family: family})

	addr := ":8080"
	log.Printf("Семейный банкинг слушает %s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("сервер завершился с ошибкой: %v", err)
	}
}
