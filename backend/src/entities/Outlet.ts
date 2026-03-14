import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { OutletMenuConfig } from "./OutletMenuConfig";
import { Sale } from "./Sale";

@Entity({ name: "outlets" })
export class Outlet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 6 })
  outlet_code!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  address!: string;

  @Column({ length: 255, nullable: true })
  password!: string;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @OneToMany(() => OutletMenuConfig, (cfg) => cfg.outlet)
  menuConfigs!: OutletMenuConfig[];

  @OneToMany(() => Sale, (sale) => sale.outlet)
  sales!: Sale[];
}
