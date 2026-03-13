import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OutletMenuConfig } from "./OutletMenuConfig";
import { SaleItem } from "./SaleItem";

@Entity({ name: "master_menu" })
export class MasterMenu {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  name!: string;

  @Column({ name: "base_price", type: "numeric", precision: 12, scale: 2 })
  basePrice!: string;

  @Column({ type: "text", unique: true })
  sku!: string;

  @OneToMany(() => OutletMenuConfig, (cfg) => cfg.menuItem)
  outletConfigs!: OutletMenuConfig[];

  @OneToMany(() => SaleItem, (item) => item.menuItem)
  saleItems!: SaleItem[];
}
