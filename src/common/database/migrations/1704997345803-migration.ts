import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1704997345803 implements MigrationInterface {
    name = 'Migration1704997345803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "files" ("id" SERIAL NOT NULL, "filePath" character varying NOT NULL, "hasReference" boolean DEFAULT false, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book_author" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_24b753b0490a992a6941451f405" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "ISBN" character varying NOT NULL, "availableQuantity" integer NOT NULL DEFAULT '0', "description" character varying, "shelfLocation" character varying, "authorId" uuid NOT NULL, CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book_borrow_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "bookId" uuid NOT NULL, "borrowerId" uuid NOT NULL, "borrowedDate" TIMESTAMP NOT NULL, "returnDate" TIMESTAMP NOT NULL, "actualReturnDate" TIMESTAMP NOT NULL, CONSTRAINT "PK_6e82bdac5727bb1ab7111b8194f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_66a4f0f47943a0d99c16ecf90b2" FOREIGN KEY ("authorId") REFERENCES "book_author"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_borrow_details" ADD CONSTRAINT "FK_08aac48d18705fcca3576b60dec" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_borrow_details" ADD CONSTRAINT "FK_78641f54891ad2a7063414cc957" FOREIGN KEY ("borrowerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_borrow_details" DROP CONSTRAINT "FK_78641f54891ad2a7063414cc957"`);
        await queryRunner.query(`ALTER TABLE "book_borrow_details" DROP CONSTRAINT "FK_08aac48d18705fcca3576b60dec"`);
        await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_66a4f0f47943a0d99c16ecf90b2"`);
        await queryRunner.query(`DROP TABLE "book_borrow_details"`);
        await queryRunner.query(`DROP TABLE "book"`);
        await queryRunner.query(`DROP TABLE "book_author"`);
        await queryRunner.query(`DROP TABLE "files"`);
    }

}
