import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MasterMenu } from "./MasterMenu";
import { Sale } from "./Sale";

@Entity({ name: "sale_items" })
@Check(`"quantity" > 0`)
@Check(`"unit_price" >= 0`)
@Index("idx_sale_items_sale", ["saleId"])
@Index("idx_sale_items_menu", ["menuItemId"])
export class SaleItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "sale_id", type: "int" })
  saleId!: number;
  @Column({ name: "quantity", type: "int" })
  quantity!: number;
  @Column({ name: "unit_price", type: "numeric", precision: 12, scale: 2 })
  unitPrice!: string;
  @Column({ name: "menu_item_id", type: "int" })
  menuItemId!: number;

  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sale_id" })
  sale!: Sale;

  @ManyToOne(() => MasterMenu, (menuItem) => menuItem.saleItems)
  @JoinColumn({ name: "menu_item_id" })
  menuItem!: MasterMenu;
}
