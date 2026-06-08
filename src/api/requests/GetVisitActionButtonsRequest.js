import { ProcessApiRequest } from './ProcessApiRequest';
import { normalizeId } from './normalizeId';
import {
    assertArray,
    assertObject,
    assertOptionalString,
    assertString,
} from '../validation';

export class GetVisitActionButtonsRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_visit_action_buttons';
    }

    get method() {
        return 'GET';
    }
    
    getMockFailureKey() {
        return this.params.tvsId;
    }

    buildProcessParams() {
        return {
            tvsid: normalizeId(this.params.tvsId),
        };
    }

    buildMockResponse() {
        const id = normalizeId(this.params.tvsId);

        return {
            buttons: [
                {
                    title: 'Отменить визит',
                    cssclass: 'btn_blue',
                    callback: `method=cancel_visit&tvsid=${id}`,
                },
            ],
        };
    }

    transformEnvelopeData(data) {
        if (Array.isArray(data)) {
            return {
                buttons: data,
            };
        }

        return data;
    }

    validateResponse(response) {
        assertObject(response, 'getVisitActionButtons.response');
        assertArray(response.buttons, 'getVisitActionButtons.response.buttons');

        response.buttons.forEach((button, index) => {
            const path = `getVisitActionButtons.response.buttons[${index}]`;
            assertObject(button, path);
            assertString(button.title, `${path}.title`, { allowEmpty: false });
            assertOptionalString(button.cssclass, `${path}.cssclass`);
            assertOptionalString(button.callback, `${path}.callback`);
            assertOptionalString(button.internal, `${path}.internal`);
        });
    }
}
