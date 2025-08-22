import { Filter } from "src/model/filter/Filter";
import { FormFieldValue } from "../../FormValues";
import { EqOperatorHandler } from "./common/EqOperatorHandler";
import { HasValueOperatorHandler } from "./common/HasValueOperatorHandler";
import { NotEqOperatorHandler } from "./common/NotEqOperatorHandler";
import { NoValueOperatorHandler } from "./common/NoValueOperatorHandler";
import { ContainsOperatorHandler } from "./list/ContainsOperatorHandler";
import { NotContainsOperatorHandler } from "./list/NotContainsOperatorHandler";
import { GteOperatorHandler } from "./number/GteOperatorHandler";
import { GtOperatorHandler } from "./number/GtOperatorHandler";
import { LteOperatorHandler } from "./number/LteOperatorHandler";
import { LtOperatorHandler } from "./number/LtOperatorHandler";

export class OperatorHandlers {

    static handlers = [
        new EqOperatorHandler(),
        new NotEqOperatorHandler(),
        new GtOperatorHandler(),
        new GteOperatorHandler(),
        new LtOperatorHandler(),
        new LteOperatorHandler(),
        new ContainsOperatorHandler(),
        new NotContainsOperatorHandler(),
        new HasValueOperatorHandler(),
        new NoValueOperatorHandler()
        // new InOperatorHandler(),
        // new NInOperatorHandler(),
        // new LikeOperatorHandler(),
        // new NotLikeOperatorHandler(),
    ]

    /**
     * 应用过滤器操作
     * @param filter 过滤器配置
     * @param fieldValue 字段值
     * @param value 比较值
     * @returns 是否匹配条件
     */
    static apply(filter: Filter, fieldValue: FormFieldValue, value: FormFieldValue): boolean {
        const handler = this.handlers.find(h => h.accept(filter));
        if (handler) {
            return handler.apply(fieldValue, value, {
                filter: filter
            });
        }
        return false;
    }
}