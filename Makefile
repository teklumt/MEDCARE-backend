# ─────────────────────────────────────────────────────────────────────────────
# MedCare Ethiopia — Test Runner
#
# Usage:
#   make test            Run all tests in all repos
#   make test-admin      Run Admin-Backend tests only
#   make test-pharmacy   Run pharmacy-delivery-payment tests only
#   make test-thesis     Run only the 5 thesis unit-test cases (TC-1 … TC-5)
#   make install         Install dependencies in all repos
#   make help            Show this help message
# ─────────────────────────────────────────────────────────────────────────────

ADMIN_DIR   := Admin-Backend
PHARMACY_DIR := pharmacy-delivery-payment

ADMIN_TEST   := node --experimental-vm-modules ./node_modules/jest/bin/jest.js --runInBand --forceExit
PHARMACY_TEST := npx jest --runInBand

GREEN  := \033[0;32m
YELLOW := \033[0;33m
CYAN   := \033[0;36m
RESET  := \033[0m

.PHONY: help test test-admin test-pharmacy test-thesis install

# ── Default target ────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "$(CYAN)MedCare Ethiopia — Test Runner$(RESET)"
	@echo "────────────────────────────────────────"
	@echo "  $(GREEN)make test$(RESET)           Run ALL tests in every repo"
	@echo "  $(GREEN)make test-admin$(RESET)     Admin-Backend tests only"
	@echo "  $(GREEN)make test-pharmacy$(RESET)  pharmacy-delivery-payment tests only"
	@echo "  $(GREEN)make test-thesis$(RESET)    Thesis unit tests (TC-1 to TC-5)"
	@echo "  $(GREEN)make install$(RESET)        Install dependencies in all repos"
	@echo ""

# ── All tests ─────────────────────────────────────────────────────────────────
test: test-admin test-pharmacy
	@echo ""
	@echo "$(GREEN)✓ All test suites complete.$(RESET)"

# ── Admin-Backend ─────────────────────────────────────────────────────────────
test-admin:
	@echo ""
	@echo "$(CYAN)▶  Admin-Backend$(RESET)"
	@echo "────────────────────────────────────────"
	cd $(ADMIN_DIR) && $(ADMIN_TEST)
	@echo "$(GREEN)✓  Admin-Backend done$(RESET)"

# ── pharmacy-delivery-payment ─────────────────────────────────────────────────
test-pharmacy:
	@echo ""
	@echo "$(CYAN)▶  pharmacy-delivery-payment$(RESET)"
	@echo "────────────────────────────────────────"
	cd $(PHARMACY_DIR) && $(PHARMACY_TEST)
	@echo "$(GREEN)✓  pharmacy-delivery-payment done$(RESET)"

# ── Thesis unit tests only (TC-1 … TC-5) ─────────────────────────────────────
test-thesis:
	@echo ""
	@echo "$(YELLOW)▶  Thesis Unit Tests — TC-1 to TC-5$(RESET)"
	@echo "────────────────────────────────────────"
	@echo ""
	@echo "$(CYAN)[Admin-Backend] TC-1 Login  |  TC-5 AI Health Assistant$(RESET)"
	cd $(ADMIN_DIR) && $(ADMIN_TEST) --testPathPatterns="unit-thesis"
	@echo ""
	@echo "$(CYAN)[pharmacy-delivery-payment] TC-2 Search  |  TC-3 Nearby  |  TC-4 Order$(RESET)"
	cd $(PHARMACY_DIR) && $(PHARMACY_TEST) "unit-thesis"
	@echo ""
	@echo "$(GREEN)✓  All 5 thesis test cases passed.$(RESET)"

# ── Install dependencies ──────────────────────────────────────────────────────
install:
	@echo ""
	@echo "$(CYAN)▶  Installing dependencies$(RESET)"
	@echo "────────────────────────────────────────"
	cd $(ADMIN_DIR) && npm install
	cd $(PHARMACY_DIR) && npm install
	@echo "$(GREEN)✓  Dependencies installed$(RESET)"
