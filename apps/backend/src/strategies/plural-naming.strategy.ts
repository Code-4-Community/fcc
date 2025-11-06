import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

export class PluralNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName || targetName.toLowerCase() + 's'; // Pluralize the table name
  }

  columnName(propertyName: string): string {
    return propertyName;
  }

  relationName(propertyName: string): string {
    return propertyName;
  }
}
