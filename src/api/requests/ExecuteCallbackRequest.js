import { ProcessApiRequest } from './ProcessApiRequest';
import { assertBoolean, assertObject, assertString } from '../validation';

export class ExecuteCallbackRequest extends ProcessApiRequest {
    get processMethod() {
        return 'execute_callback';
    }

    getMockFailureKey() {
        return this.params.callback;
    }

    buildProcessParams() {
        return {
            callback: String(this.params.callback || ''),
        };
    }

    buildMockResponse() {
        const params = new URLSearchParams(this.params.callback);
        const method = params.get('method');

        return {
            ok: true,
            message:
                method === 'cancel_visit'
                    ? 'Визит отменён'
                    : 'Команда выполнена',
        };
    }

    validateResponse(response) {
        assertObject(response, 'executeCallback.response');
        assertBoolean(response.ok, 'executeCallback.response.ok');
        assertString(response.message, 'executeCallback.response.message', {
            allowEmpty: false,
        });
    }
}
