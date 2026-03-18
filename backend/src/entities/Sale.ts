import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Outlet } from "./Outlet";
import { SaleItem } from "./SaleItem";

@Entity({ name: "sales" })
@Unique(["outletId", "receiptNumber"])
@Check(`"total_amount" >= 0`)
@Index("idx_sales_outlet_created", ["outletId", "createdAt"])
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "outlet_id", type: "int" })
  outletId!: number;
  @Column({ name: "receipt_number", type: "int" })
  receiptNumber!: number;

  @Column({ name: "total_amount", type: "numeric", precision: 12, scale: 2 })
  totalAmount!: string;

  @Column({ name: "created_at", type: "timestamptz", default: () => "now()" })
  createdAt!: Date;

  @ManyToOne(() => Outlet, (outlet) => outlet.sales, { onDelete: "CASCADE" })
  @JoinColumn({ name: "outlet_id" })
  outlet!: Outlet;

  @OneToMany(() => SaleItem, (item) => item.sale)
  items!: SaleItem[];
}
