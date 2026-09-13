import sys
import os

# Add parent path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from sqlalchemy import text
from app.core.database import engine, SessionLocal
from app.models import SupportCase, ResolutionAction, Inventory, Order, Customer, PolicyChunk
from app.services.verification_service import VerificationService

def run_integrity_checks():
    print("=" * 60)
    print("  RESOLVE OS - DATABASE INTEGRITY & HEALTH AUDIT")
    print("=" * 60)
    
    db = SessionLocal()
    errors = []
    warnings = []
    
    try:
        # 1. Low-level Engine Check (SQLite PRAGMA if SQLite)
        if "sqlite" in str(engine.url):
            integrity = db.execute(text("PRAGMA integrity_check;")).fetchall()
            fk_check = db.execute(text("PRAGMA foreign_key_check;")).fetchall()
            
            print(f"1. Low-Level Database File Check: {integrity[0][0].upper()}")
            if fk_check:
                errors.append(f"Foreign Key Violations found: {fk_check}")
            else:
                print("   [+] Foreign Key Constraints: OK (0 violations)")
        else:
            print("1. Low-Level Database Connection: OK (PostgreSQL/SQLAlchemy Engine)")

        # 2. Entity Counts Summary
        customers_cnt = db.query(Customer).count()
        orders_cnt = db.query(Order).count()
        cases_cnt = db.query(SupportCase).count()
        actions_cnt = db.query(ResolutionAction).count()
        policies_cnt = db.query(PolicyChunk).count()

        print("\n2. Database Entity Summary:")
        print(f"   [+] Customers: {customers_cnt}")
        print(f"   [+] Orders: {orders_cnt}")
        print(f"   [+] Support Cases: {cases_cnt}")
        print(f"   [+] Resolution Actions: {actions_cnt}")
        print(f"   [+] Policy RAG Chunks: {policies_cnt}")

        # 3. Domain Relationship & Orphan Integrity Check
        print("\n3. Domain Relationship Integrity Check:")
        
        # Check orphaned cases
        orphaned_cases = db.execute(text(
            "SELECT id FROM support_cases WHERE customer_id NOT IN (SELECT id FROM customers)"
        )).fetchall()
        if orphaned_cases:
            errors.append(f"Orphaned cases found with invalid customer_id: {len(orphaned_cases)}")
        else:
            print("   [+] Support Case -> Customer Links: OK")

        # Check orphaned actions
        orphaned_actions = db.execute(text(
            "SELECT id FROM resolution_actions WHERE case_id NOT IN (SELECT id FROM support_cases)"
        )).fetchall()
        if orphaned_actions:
            errors.append(f"Orphaned actions found with invalid case_id: {len(orphaned_actions)}")
        else:
            print("   [+] Resolution Action -> Support Case Links: OK")

        # 4. Inventory Consistency Check
        print("\n4. Warehouse Inventory Math Integrity:")
        inv_math_errors = db.execute(text(
            "SELECT id, quantity_on_hand, reserved_quantity, quantity_available FROM inventory "
            "WHERE quantity_available != (quantity_on_hand - reserved_quantity) OR reserved_quantity > quantity_on_hand"
        )).fetchall()
        if inv_math_errors:
            errors.append(f"Inventory quantity mismatch in {len(inv_math_errors)} inventory rows!")
        else:
            print("   [+] Stock Levels (Available = OnHand - Reserved): OK")

        # 5. Idempotency Key Uniqueness Check
        print("\n5. Idempotency & Audit Trail Uniqueness Check:")
        dup_keys = db.execute(text(
            "SELECT idempotency_key, COUNT(*) FROM resolution_actions "
            "WHERE idempotency_key IS NOT NULL GROUP BY idempotency_key HAVING COUNT(*) > 1"
        )).fetchall()
        if dup_keys:
            errors.append(f"Duplicate Idempotency Keys detected in resolution_actions: {dup_keys}")
        else:
            print("   [+] Idempotency Key Uniqueness: OK")

        # 6. Post-Action State Independent Verification Engine
        print("\n6. Independent Post-Action Verification Engine:")
        resolved_cases = db.query(SupportCase).filter(SupportCase.status == "resolved").all()
        verified_cases_cnt = 0
        for case in resolved_cases:
            verif = VerificationService.verify_case_resolution(db, case.id)
            if not verif["verified"]:
                warnings.append(f"Case {case.case_number} state mismatch: {verif['discrepancies']}")
            else:
                verified_cases_cnt += 1
        print(f"   [+] Verified Resolved Cases: {verified_cases_cnt}/{len(resolved_cases)} verified clean")

        # Final Summary
        print("\n" + "=" * 60)
        if errors:
            print("[X] INTEGRITY CHECK FAILED:")
            for err in errors:
                print(f"  • {err}")
            sys.exit(1)
        else:
            print("[SUCCESS] ALL DATABASE INTEGRITY CHECKS PASSED PERFECTLY!")
            if warnings:
                print("[WARNING] Warnings:")
                for w in warnings:
                    print(f"  • {w}")
            print("=" * 60)
            
    finally:
        db.close()

if __name__ == "__main__":
    run_integrity_checks()
