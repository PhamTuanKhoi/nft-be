import { QueryDto } from '../../global/dtos/query.dto';
import { UserFilter } from '../interfaces/userFilter.interface';

export class QueryUserDto extends QueryDto implements UserFilter {
}
