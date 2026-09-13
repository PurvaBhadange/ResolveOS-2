import enum
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, Enum, ForeignKey, Numeric, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


# Enums
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    SUPPORT_AGENT = "support_agent"
    OPERATIONS = "operations"
    VIEWER = "viewer"


class CustomerTier(str, enum.Enum):
    STANDARD = "standard"
    SILVER = "silver"
    GOLD = "gold"
    VIP = "vip"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIALLY_REFUNDED = "partially_refunded"
    REFUNDED = "refunded"
    FAILED = "failed"


class ShipmentStatus(str, enum.Enum):
    MANIFESTED = "manifested"
    IN_TRANSIT = "in_transit"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    FAILED = "failed"


class CaseStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    UNDERSTANDING = "understanding"
    EVIDENCE_COLLECTED = "evidence_collected"
    RESOLUTION_PROPOSED = "resolution_proposed"
    AWAITING_APPROVAL = "awaiting_approval"
    ACTION_EXECUTING = "action_executing"
    VERIFYING = "verifying"
    RESOLVED = "resolved"
    REPLANNING = "replanning"
    ESCALATED = "escalated"


class EventType(str, enum.Enum):
    GOAL = "GOAL"
    EVIDENCE = "EVIDENCE"
    DECISION = "DECISION"
    ACTION = "ACTION"
    RESULT = "RESULT"
    ADAPTATION = "ADAPTATION"
    VERIFICATION = "VERIFICATION"
    OUTCOME = "OUTCOME"


class ActionType(str, enum.Enum):
    REFUND = "refund"
    REPLACE = "replace"
    CANCEL = "cancel"
    STORE_CREDIT = "store_credit"
    ESCALATE = "escalate"


class ActionStatus(str, enum.Enum):
    PENDING = "pending"
    AWAITING_APPROVAL = "awaiting_approval"
    EXECUTING = "executing"
    VERIFIED = "verified"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ApprovalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.SUPPORT_AGENT.value, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_number = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    tier = Column(String(50), default=CustomerTier.STANDARD.value, nullable=False)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    addresses = relationship("CustomerAddress", back_populates="customer", cascade="all, delete-orphan")
    profile = relationship("CustomerProfile", back_populates="customer", uselist=False, cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="customer")
    cases = relationship("SupportCase", back_populates="customer")


class CustomerAddress(Base):
    __tablename__ = "customer_addresses"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), default="US", nullable=False)
    is_default = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="addresses")


class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), unique=True, nullable=False)
    total_orders = Column(Integer, default=0)
    lifetime_value = Column(Numeric(10, 2), default=0.00)
    fraud_score = Column(Float, default=0.0)
    return_rate = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="profile")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    brand = Column(String(100), nullable=False)
    base_price = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    variant_sku = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    color = Column(String(50), nullable=True)
    size = Column(String(50), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="variants")
    inventory_items = relationship("Inventory", back_populates="variant")
    order_items = relationship("OrderItem", back_populates="variant")


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory_items = relationship("Inventory", back_populates="warehouse")


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=False)
    available_stock = Column(Integer, default=0, nullable=False)
    reserved_stock = Column(Integer, default=0, nullable=False)
    total_stock = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    warehouse = relationship("Warehouse", back_populates="inventory_items")
    variant = relationship("ProductVariant", back_populates="inventory_items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(64), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="USD")
    order_status = Column(String(50), default=OrderStatus.PROCESSING.value, nullable=False)
    payment_status = Column(String(50), default=PaymentStatus.PAID.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    shipment = relationship("Shipment", back_populates="order", uselist=False)
    payment = relationship("Payment", back_populates="order", uselist=False)
    returns = relationship("Return", back_populates="order")
    refunds = relationship("Refund", back_populates="order")
    replacements = relationship("ReplacementRequest", back_populates="order")
    cases = relationship("SupportCase", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    item_status = Column(String(50), default="fulfilled")

    order = relationship("Order", back_populates="items")
    variant = relationship("ProductVariant", back_populates="order_items")


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    tracking_number = Column(String(100), unique=True, index=True, nullable=False)
    carrier = Column(String(100), nullable=False)
    shipping_status = Column(String(50), default=ShipmentStatus.IN_TRANSIT.value, nullable=False)
    estimated_delivery = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="shipment")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    transaction_id = Column(String(100), unique=True, index=True, nullable=False)
    payment_method = Column(String(50), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_status = Column(String(50), default=PaymentStatus.PAID.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payment")


class Return(Base):
    __tablename__ = "returns"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    return_number = Column(String(64), unique=True, index=True, nullable=False)
    reason_code = Column(String(100), nullable=False)
    return_status = Column(String(50), default="requested", nullable=False)
    tracking_number = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="returns")


class Refund(Base):
    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    refund_number = Column(String(64), unique=True, index=True, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    reason = Column(String(255), nullable=False)
    refund_status = Column(String(50), default="processed", nullable=False)
    idempotency_key = Column(String(128), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="refunds")


class ReplacementRequest(Base):
    __tablename__ = "replacement_requests"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    original_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=False)
    replacement_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    replacement_status = Column(String(50), default="allocated", nullable=False)
    idempotency_key = Column(String(128), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="replacements")


class SupportCase(Base):
    __tablename__ = "support_cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(64), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="return_refund")
    case_status = Column(String(50), default=CaseStatus.SUBMITTED.value, nullable=False)
    priority = Column(String(50), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="cases")
    order = relationship("Order", back_populates="cases")
    actions = relationship("ResolutionAction", back_populates="case")
    events = relationship("AgentEvent", back_populates="case")
    approvals = relationship("Approval", back_populates="case")
    escalations = relationship("Escalation", back_populates="case")


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    versions = relationship("PolicyVersion", back_populates="policy", cascade="all, delete-orphan")


class PolicyVersion(Base):
    __tablename__ = "policy_versions"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    version_number = Column(String(20), nullable=False)
    effective_date = Column(DateTime, nullable=False)
    return_window_days = Column(Integer, default=30, nullable=False)
    conditions_json = Column(JSON, nullable=True)
    policy_text = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    policy = relationship("Policy", back_populates="versions")
    chunks = relationship("PolicyChunk", back_populates="policy_version", cascade="all, delete-orphan")


class PolicyChunk(Base):
    __tablename__ = "policy_chunks"

    id = Column(Integer, primary_key=True, index=True)
    policy_version_id = Column(Integer, ForeignKey("policy_versions.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    policy_version = relationship("PolicyVersion", back_populates="chunks")


class ResolutionAction(Base):
    __tablename__ = "resolution_actions"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("support_cases.id"), nullable=False)
    action_type = Column(String(50), nullable=False)
    parameters_json = Column(JSON, nullable=False)
    execution_status = Column(String(50), default=ActionStatus.PENDING.value, nullable=False)
    idempotency_key = Column(String(128), unique=True, index=True, nullable=False)
    executed_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("SupportCase", back_populates="actions")


class ActionAuditLog(Base):
    __tablename__ = "action_audit_log"

    id = Column(Integer, primary_key=True, index=True)
    action_id = Column(Integer, ForeignKey("resolution_actions.id"), nullable=True)
    case_id = Column(Integer, ForeignKey("support_cases.id"), nullable=False)
    actor_type = Column(String(50), default="agent")  # agent, human, system
    actor_id = Column(String(100), default="resolveos_agent")
    event_name = Column(String(100), nullable=False)
    payload_json = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("support_cases.id"), nullable=False)
    graph_run_id = Column(String(128), unique=True, index=True, nullable=False)
    current_node = Column(String(100), nullable=False)
    status = Column(String(50), default="running")
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class AgentEvent(Base):
    __tablename__ = "agent_events"

    id = Column(Integer, primary_key=True, index=True)
    agent_run_id = Column(Integer, ForeignKey("agent_runs.id"), nullable=True)
    case_id = Column(Integer, ForeignKey("support_cases.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # GOAL, EVIDENCE, DECISION, ACTION, RESULT, ADAPTATION, VERIFICATION, OUTCOME
    title = Column(String(255), nullable=False)
    detail_json = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    case = relationship("SupportCase", back_populates="events")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("support_cases.id"), nullable=False)
    action_id = Column(Integer, ForeignKey("resolution_actions.id"), nullable=True)
    requester_type = Column(String(50), default="agent")
    required_role = Column(String(50), default=UserRole.OPERATIONS.value)
    status = Column(String(50), default=ApprovalStatus.PENDING.value)
    reason = Column(Text, nullable=False)
    decision_by = Column(String(255), nullable=True)
    decision_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("SupportCase", back_populates="approvals")


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("support_cases.id"), nullable=False)
    escalation_reason = Column(Text, nullable=False)
    priority = Column(String(50), default="high")
    status = Column(String(50), default="open")  # open, under_review, resolved
    assigned_to = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("SupportCase", back_populates="escalations")
