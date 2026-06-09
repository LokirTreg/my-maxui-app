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
        const query = new URLSearchParams();
        query.set('method', this.processMethod);

        if (this.method !== 'POST') {
            Object.entries(this.buildProcessParams()).forEach(
                ([key, value]) => {
                    query.set(key, value);
                }
            );
        }

        return query;
    }

    buildBody() {
        if (this.method !== 'POST') {
            return undefined;
        }

        return JSON.stringify({
            data: this.buildProcessParams(),
        });
    }

    buildProcessParams() {
        return {};
    }
}
