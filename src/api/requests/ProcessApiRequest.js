import { BaseApiRequest } from '../BaseApiRequest';

export class ProcessApiRequest extends BaseApiRequest {
    get endpoint() {
        return 'https://tsm.ant-tech.ru/Demo_108/MAX/MiniAppService.aspx';
    }

    get method() {
        return 'POST';
    }

    get processMethod() {
        throw new Error('processMethod must be defined in child request class');
    }

    buildQuery() {
        const query = new URLSearchParams(this.buildProcessParams());
        query.set('method', this.processMethod);
        return query;
    }

    buildProcessParams() {
        return {};
    }
}
