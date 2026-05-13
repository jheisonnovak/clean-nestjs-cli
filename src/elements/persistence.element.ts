export const typeOrmPersistenceElement = (entityName: string, tableName: string): string => `import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "${tableName}" })
export class ${entityName} {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	constructor(entity?: Partial<${entityName}>) {
		Object.assign(this, entity);
	}
}
`;
