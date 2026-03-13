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
import { Outlet } from "./Outlet";

@Entity({ name: "outlet_menu_configs" })
@Index(["outletId", "menuItemId"], { unique: true })
@Check(`"outlet_price" >= 0`)
@Check(`"stock_level" >= 0`)
export class OutletMenuConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "outlet_id", type: "int" })
  outletId!: number;

  @Column({ name: "menu_item_id", type: "int" })
  menuItemId!: number;

  @Column({ name: "outlet_price", type: "numeric", precision: 12, scale: 2 })
  outletPrice!: string;

  @Column({ name: "stock_level", type: "int", default: 0 })
  stockLevel!: number;

  @ManyToOne(() => Outlet, (outlet) => outlet.menuConfigs, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "outlet_id" })
  outlet!: Outlet;

  @ManyToOne(() => MasterMenu, (menu) => menu.outletConfigs, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "menu_item_id" })
  menuItem!: MasterMenu;
}
