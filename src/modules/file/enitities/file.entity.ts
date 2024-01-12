import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column()
  filePath: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  hasReference?: boolean;
}
