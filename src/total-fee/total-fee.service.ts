import { Injectable, Logger } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { CreateTotalFeeDto } from './dto/create-total-fee.dto';
import { QueryTotalFreeDto } from './dto/query-total-fee.dto';
import { UpdateTotalFeeDto } from './dto/update-total-fee.dto';
import { TotalFee } from './schema/total-fee.schema';

@Injectable()
export class TotalFeeService {
  private readonly logger = new Logger(TotalFeeService.name);
  constructor(
    @InjectModel(TotalFee)
    private readonly model: ReturnModelType<typeof TotalFee>,
  ) {}

  create(createTotalFeeDto: CreateTotalFeeDto) {
    return 'This action adds a new totalFee';
  }

  async findAll(query: QueryTotalFreeDto) {
    try {
      let tmp: any = [];

      if (query.sortBy !== undefined && query.sortBy.length > 0) {
        tmp = [
          ...tmp,
          {
            $sort: {
              [query.sortBy]: query.sortType,
            },
          },
        ];
      } else {
        tmp = [
          ...tmp,
          {
            $sort: {
              currentLevel: -1,
            },
          },
        ];
      }

      let findQuery = this.model.aggregate(tmp);
      const count = (await findQuery.exec()).length;
      if (
        query.limit !== undefined &&
        query.page !== undefined &&
        query.limit > 0 &&
        query.page > 0
      ) {
        findQuery = findQuery
          .skip((query.page - 1) * query.limit)
          .limit(query.limit);
      }
      const result = await findQuery.exec();
      return {
        items: result,
        paginate: {
          count: count || 0,
          limit: query.limit || 0,
          page: query.page || 0,
        },
      };
    } catch (error) {
      console.log(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} totalFee`;
  }

  update(id: number, updateTotalFeeDto: UpdateTotalFeeDto) {
    return `This action updates a #${id} totalFee`;
  }

  remove(id: number) {
    return `This action removes a #${id} totalFee`;
  }
}
