import logging
import os
import sys

# Ensure repository root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app.core.database import Base, engine, SessionLocal

from app.models import (
    User, UserRole,
    Customer, CustomerTier, CustomerAddress, CustomerProfile,
    Product, ProductVariant, Warehouse, Inventory,
    Order, OrderStatus, PaymentStatus, OrderItem, Shipment, ShipmentStatus, Payment,
    Return, Refund, ReplacementRequest,
    SupportCase, CaseStatus,
    Policy, PolicyVersion, PolicyChunk
)
from passlib.context import CryptContext

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def seed_database(force: bool = False):
    logger.info("Starting database seed process...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded unless forced
        if not force and db.query(Customer).first():
            logger.info("Database already contains data. Skipping seed.")
            return

        if force:
            logger.info("Force clear existing data...")
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

        # 1. Staff Users
        staff_users = [
            User(
                email="admin@resolveos.com",
                full_name="Admin Supervisor",
                role=UserRole.ADMIN.value,
                hashed_password=get_password_hash("AdminSecret123!"),
            ),
            User(
                email="ops@resolveos.com",
                full_name="Operations Lead",
                role=UserRole.OPERATIONS.value,
                hashed_password=get_password_hash("OpsSecret123!"),
            ),
            User(
                email="agent@resolveos.com",
                full_name="Support Agent Tier 2",
                role=UserRole.SUPPORT_AGENT.value,
                hashed_password=get_password_hash("AgentSecret123!"),
            ),
        ]
        db.add_all(staff_users)
        db.commit()

        # 2. Warehouses
        warehouses = [
            Warehouse(code="WH-EAST", name="East Coast Logistics Hub", location="Newark, NJ", is_active=True),
            Warehouse(code="WH-WEST", name="West Coast Distribution Center", location="Reno, NV", is_active=True),
            Warehouse(code="WH-CENTRAL", name="Midwest Fulfillment Hub", location="Chicago, IL", is_active=True),
        ]
        db.add_all(warehouses)
        db.commit()

        # 3. Products & Product Variants
        p1 = Product(sku="PROD-HD100", name="AuraSound Noise-Canceling Wireless Headphones", category="Electronics", brand="AuraSound", base_price=Decimal("199.99"), description="Premium over-ear active noise canceling headphones.")
        p2 = Product(sku="PROD-SW200", name="Apex Fit Pro Smartwatch", category="Electronics", brand="Apex", base_price=Decimal("249.99"), description="Advanced fitness tracking smartwatch with heart rate & GPS.")
        p3 = Product(sku="PROD-EB300", name="Pulse True Wireless Earbuds", category="Electronics", brand="AuraSound", base_price=Decimal("89.99"), description="Compact true wireless earbuds with IPX7 water resistance.")
        p4 = Product(sku="PROD-KB400", name="ErgoMech RGB Mechanical Keyboard", category="Accessories", brand="TechCraft", base_price=Decimal("129.99"), description="Hot-swappable mechanical keyboard with RGB backlighting.")
        p5 = Product(sku="PROD-BP500", name="Nomad Waterproof Laptop Backpack", category="Bags", brand="Nomad", base_price=Decimal("79.99"), description="Durable 25L waterproof laptop travel backpack.")

        db.add_all([p1, p2, p3, p4, p5])
        db.commit()

        # Variants
        v1 = ProductVariant(product_id=p1.id, variant_sku="SKU-HD-BLK", title="AuraSound Headphones - Matte Black", color="Matte Black", price=Decimal("199.99"))
        v2 = ProductVariant(product_id=p1.id, variant_sku="SKU-HD-SLV", title="AuraSound Headphones - Silver Steel", color="Silver Steel", price=Decimal("199.99"))
        v3 = ProductVariant(product_id=p2.id, variant_sku="SKU-SW-BLK", title="Apex Smartwatch - Obsidian Black", color="Obsidian Black", price=Decimal("249.99"))
        v4 = ProductVariant(product_id=p3.id, variant_sku="SKU-EB-WHT", title="Pulse Earbuds - Ceramic White", color="Ceramic White", price=Decimal("89.99"))
        v5 = ProductVariant(product_id=p4.id, variant_sku="SKU-KB-BRN", title="ErgoMech Keyboard - Tactile Brown Switches", color="Black", price=Decimal("129.99"))
        v6 = ProductVariant(product_id=p5.id, variant_sku="SKU-BP-GRY", title="Nomad Backpack - Slate Grey", color="Slate Grey", price=Decimal("79.99"))

        db.add_all([v1, v2, v3, v4, v5, v6])
        db.commit()

        # 4. Inventory
        # NOTE FOR DEMO: SKU-HD-BLK is out of stock across WH-EAST and WH-WEST!
        inventory_items = [
            Inventory(warehouse_id=warehouses[0].id, variant_id=v1.id, available_stock=0, reserved_stock=0, total_stock=0),  # OUT OF STOCK!
            Inventory(warehouse_id=warehouses[1].id, variant_id=v1.id, available_stock=0, reserved_stock=0, total_stock=0),  # OUT OF STOCK!
            Inventory(warehouse_id=warehouses[2].id, variant_id=v1.id, available_stock=0, reserved_stock=0, total_stock=0),  # OUT OF STOCK!
            Inventory(warehouse_id=warehouses[0].id, variant_id=v2.id, available_stock=15, reserved_stock=2, total_stock=17),
            Inventory(warehouse_id=warehouses[1].id, variant_id=v3.id, available_stock=8, reserved_stock=1, total_stock=9),
            Inventory(warehouse_id=warehouses[0].id, variant_id=v4.id, available_stock=42, reserved_stock=5, total_stock=47),
            Inventory(warehouse_id=warehouses[1].id, variant_id=v5.id, available_stock=20, reserved_stock=0, total_stock=20),
            Inventory(warehouse_id=warehouses[2].id, variant_id=v6.id, available_stock=35, reserved_stock=3, total_stock=38),
        ]
        db.add_all(inventory_items)
        db.commit()

        # 5. Customers (15 customers)
        customer_names = [
            ("Sarah Jenkins", "sarah.jenkins@example.com", CustomerTier.GOLD.value, "555-0101"),
            ("Marcus Chen", "marcus.chen@example.com", CustomerTier.VIP.value, "555-0102"),
            ("Elena Rostova", "elena.rostova@example.com", CustomerTier.SILVER.value, "555-0103"),
            ("David Miller", "david.miller@example.com", CustomerTier.STANDARD.value, "555-0104"),
            ("Aisha Patel", "aisha.patel@example.com", CustomerTier.GOLD.value, "555-0105"),
            ("Carlos Gomez", "carlos.gomez@example.com", CustomerTier.STANDARD.value, "555-0106"),
            ("Hannah Abbott", "hannah.abbott@example.com", CustomerTier.SILVER.value, "555-0107"),
            ("Liam O'Connor", "liam.oconnor@example.com", CustomerTier.STANDARD.value, "555-0108"),
            ("Priya Sharma", "priya.sharma@example.com", CustomerTier.VIP.value, "555-0109"),
            ("James Wilson", "james.wilson@example.com", CustomerTier.STANDARD.value, "555-0110"),
            ("Kaitlyn Vance", "kaitlyn.vance@example.com", CustomerTier.GOLD.value, "555-0111"),
            ("Robert Taylor", "robert.taylor@example.com", CustomerTier.STANDARD.value, "555-0112"),
            ("Naomi Takahashi", "naomi.takahashi@example.com", CustomerTier.SILVER.value, "555-0113"),
            ("Daniel Kim", "daniel.kim@example.com", CustomerTier.STANDARD.value, "555-0114"),
            ("Sophia Rivera", "sophia.rivera@example.com", CustomerTier.GOLD.value, "555-0115"),
        ]

        customers = []
        for idx, (name, email, tier, phone) in enumerate(customer_names, start=1001):
            c = Customer(
                customer_number=f"CUST-{idx}",
                full_name=name,
                email=email,
                phone=phone,
                tier=tier,
                status="active"
            )
            customers.append(c)
        db.add_all(customers)
        db.commit()

        # Profiles & Addresses
        for idx, c in enumerate(customers):
            addr = CustomerAddress(
                customer_id=c.id,
                address_line1=f"{100 + idx} Main Street",
                city="Austin",
                state="TX",
                postal_code=f"7870{idx % 10}",
                country="US",
                is_default=True
            )
            prof = CustomerProfile(
                customer_id=c.id,
                total_orders=idx + 1,
                lifetime_value=Decimal(str((idx + 1) * 150.0)),
                fraud_score=0.01,
                return_rate=0.05
            )
            db.add_all([addr, prof])
        db.commit()

        # 6. Orders & Order Items & Shipments
        now = datetime.utcnow()
        orders = []
        
        # DEMO ORDER 1: Sarah Jenkins (CUST-1001) - Headphones damaged request
        o1 = Order(
            order_number="ORD-2026-8801",
            customer_id=customers[0].id,
            total_amount=Decimal("199.99"),
            currency="USD",
            order_status=OrderStatus.DELIVERED.value,
            payment_status=PaymentStatus.PAID.value,
            created_at=now - timedelta(days=5),
            updated_at=now - timedelta(days=2)
        )
        db.add(o1)
        db.commit()

        oi1 = OrderItem(order_id=o1.id, variant_id=v1.id, quantity=1, unit_price=Decimal("199.99"), total_price=Decimal("199.99"), item_status="delivered")
        sh1 = Shipment(order_id=o1.id, tracking_number="TRK-8801-US", carrier="FedEx", shipping_status=ShipmentStatus.DELIVERED.value, delivered_at=now - timedelta(days=2))
        pm1 = Payment(order_id=o1.id, transaction_id="TXN-PAY-8801", payment_method="Credit Card (Visa ****4242)", amount=Decimal("199.99"), payment_status=PaymentStatus.PAID.value)
        db.add_all([oi1, sh1, pm1])

        # DEMO ORDER 2: High Value Refund Requiring Approval ($499.98)
        o2 = Order(
            order_number="ORD-2026-8802",
            customer_id=customers[1].id,
            total_amount=Decimal("499.98"),
            currency="USD",
            order_status=OrderStatus.DELIVERED.value,
            payment_status=PaymentStatus.PAID.value,
            created_at=now - timedelta(days=7),
            updated_at=now - timedelta(days=3)
        )
        db.add(o2)
        db.commit()
        oi2 = OrderItem(order_id=o2.id, variant_id=v3.id, quantity=2, unit_price=Decimal("249.99"), total_price=Decimal("499.98"), item_status="delivered")
        sh2 = Shipment(order_id=o2.id, tracking_number="TRK-8802-US", carrier="UPS", shipping_status=ShipmentStatus.DELIVERED.value, delivered_at=now - timedelta(days=3))
        pm2 = Payment(order_id=o2.id, transaction_id="TXN-PAY-8802", payment_method="Amex ****1005", amount=Decimal("499.98"), payment_status=PaymentStatus.PAID.value)
        db.add_all([oi2, sh2, pm2])

        # DEMO ORDER 3: Expired Return Window (Order created 45 days ago)
        o3 = Order(
            order_number="ORD-2026-8803",
            customer_id=customers[2].id,
            total_amount=Decimal("89.99"),
            currency="USD",
            order_status=OrderStatus.DELIVERED.value,
            payment_status=PaymentStatus.PAID.value,
            created_at=now - timedelta(days=45),
            updated_at=now - timedelta(days=40)
        )
        db.add(o3)
        db.commit()
        oi3 = OrderItem(order_id=o3.id, variant_id=v4.id, quantity=1, unit_price=Decimal("89.99"), total_price=Decimal("89.99"), item_status="delivered")
        sh3 = Shipment(order_id=o3.id, tracking_number="TRK-8803-US", carrier="USPS", shipping_status=ShipmentStatus.DELIVERED.value, delivered_at=now - timedelta(days=40))
        pm3 = Payment(order_id=o3.id, transaction_id="TXN-PAY-8803", payment_method="Mastercard ****8811", amount=Decimal("89.99"), payment_status=PaymentStatus.PAID.value)
        db.add_all([oi3, sh3, pm3])

        # DEMO ORDER 4: Processing Order (Can be cancelled before shipment)
        o4 = Order(
            order_number="ORD-2026-8804",
            customer_id=customers[3].id,
            total_amount=Decimal("129.99"),
            currency="USD",
            order_status=OrderStatus.PROCESSING.value,
            payment_status=PaymentStatus.PAID.value,
            created_at=now - timedelta(hours=4),
            updated_at=now - timedelta(hours=4)
        )
        db.add(o4)
        db.commit()
        oi4 = OrderItem(order_id=o4.id, variant_id=v5.id, quantity=1, unit_price=Decimal("129.99"), total_price=Decimal("129.99"), item_status="processing")
        pm4 = Payment(order_id=o4.id, transaction_id="TXN-PAY-8804", payment_method="PayPal", amount=Decimal("129.99"), payment_status=PaymentStatus.PAID.value)
        db.add_all([oi4, pm4])

        # Additional 26 orders for rich dataset
        variants_pool = [v2, v3, v4, v5, v6]
        for i in range(5, 31):
            cust = customers[i % len(customers)]
            var = variants_pool[i % len(variants_pool)]
            qty = (i % 2) + 1
            tot = Decimal(str(var.price * qty))
            o = Order(
                order_number=f"ORD-2026-88{i:02d}",
                customer_id=cust.id,
                total_amount=tot,
                currency="USD",
                order_status=OrderStatus.DELIVERED.value if i % 3 != 0 else OrderStatus.SHIPPED.value,
                payment_status=PaymentStatus.PAID.value,
                created_at=now - timedelta(days=i),
                updated_at=now - timedelta(days=i - 1)
            )
            db.add(o)
            db.commit()
            item = OrderItem(order_id=o.id, variant_id=var.id, quantity=qty, unit_price=var.price, total_price=tot, item_status="fulfilled")
            sh = Shipment(order_id=o.id, tracking_number=f"TRK-88{i:02d}-US", carrier="FedEx" if i % 2 == 0 else "UPS", shipping_status=ShipmentStatus.DELIVERED.value if i % 3 != 0 else ShipmentStatus.IN_TRANSIT.value)
            pm = Payment(order_id=o.id, transaction_id=f"TXN-PAY-88{i:02d}", payment_method="Credit Card", amount=tot, payment_status=PaymentStatus.PAID.value)
            db.add_all([item, sh, pm])

        db.commit()

        # 7. Policies & Policy Versions
        policy_ret = Policy(code="POL-RETURN", name="Electronics Return & Replacement Policy", category="Returns & Refunds")
        policy_canc = Policy(code="POL-CANCEL", name="Order Cancellation Policy", category="Order Management")
        db.add_all([policy_ret, policy_canc])
        db.commit()

        # Policy Version 1 (30 day return window)
        pv1 = PolicyVersion(
            policy_id=policy_ret.id,
            version_number="v1.0",
            effective_date=datetime(2025, 1, 1),
            return_window_days=30,
            conditions_json={"max_auto_refund": 200.0, "requires_receipt": True},
            policy_text="""# Electronics Return & Replacement Policy v1.0
- **Return Window**: Customers may request a return or replacement within 30 days of delivery.
- **Damaged Items**: If an item arrives damaged or defective, customer is eligible for immediate replacement or full refund.
- **Inventory Replanning**: If replacement item is out of stock in all warehouses, customer must be offered full refund or store credit.
- **High-Value Threshold**: Refunds exceeding $200.00 require human operations approval before execution.
""",
            is_active=False
        )

        # Policy Version 2 (Current Active Version - 15 day return window for electronics)
        pv2 = PolicyVersion(
            policy_id=policy_ret.id,
            version_number="v2.0",
            effective_date=datetime(2026, 1, 1),
            return_window_days=15,
            conditions_json={"max_auto_refund": 200.0, "requires_receipt": True, "electronic_window_days": 15},
            policy_text="""# Electronics Return & Replacement Policy v2.0
- **Return Window**: All electronic items must be returned within 15 days of delivery.
- **Damaged Items**: Items delivered damaged are eligible for replacement. If identical replacement variant is out of stock across all warehouses, the system must automatically adapt to issue a full refund.
- **Human Approval Gate**: Any refund or replacement exceeding $200.00 total value must be routed to human operations approval queue.
- **Verification Requirement**: All executed actions must undergo independent state verification against enterprise database records before case closure.
""",
            is_active=True
        )

        db.add_all([pv1, pv2])
        db.commit()

        # Chunks for RAG
        c1 = PolicyChunk(policy_version_id=pv2.id, chunk_index=0, content="Electronics Return Policy v2.0: Return window is 15 days from delivery for all electronic products.")
        c2 = PolicyChunk(policy_version_id=pv2.id, chunk_index=1, content="Damaged Items & Stockouts: Damaged items get free replacement. If out of stock, system adapts plan to issue full refund.")
        c3 = PolicyChunk(policy_version_id=pv2.id, chunk_index=2, content="Approval Rules: Refunds over $200 require human operations approval.")
        db.add_all([c1, c2, c3])
        db.commit()

        # 8. Primary Demo Case
        case1 = SupportCase(
            case_number="CASE-2026-1001",
            customer_id=customers[0].id,
            order_id=o1.id,
            title="Headphones arrived damaged - Request replacement",
            description="My AuraSound headphones arrived yesterday with a cracked left ear cup and sound distortion. I want a replacement.",
            category="return_refund",
            case_status=CaseStatus.SUBMITTED.value,
            priority="high"
        )
        db.add(case1)
        db.commit()

        logger.info("Database seeding successfully completed!")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(force=True)
