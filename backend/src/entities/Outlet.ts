import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { OutletMenuConfig } from "./OutletMenuConfig";
import { Sale } from "./Sale";

@Entity({ name: "outlets" })
export class Outlet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "outlet_code", unique: true, length: 6 })
  outletCode!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  address!: string;

  @OneToMany(() => OutletMenuConfig, (cfg) => cfg.outlet)
  menuConfigs!: OutletMenuConfig[];

  @OneToMany(() => Sale, (sale) => sale.outlet)
  sales!: Sale[];
}
