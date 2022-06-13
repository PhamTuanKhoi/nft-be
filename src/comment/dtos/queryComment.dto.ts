import { QueryDto } from '../../global/dtos/query.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransactionFilterInterface } from 'src/event/interfaces/transactionFilter.interface';

export class QueryComment
    extends QueryDto
    implements TransactionFilterInterface {

    @IsOptional()
    search: string;
}
