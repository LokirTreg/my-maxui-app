import { ProcessApiRequest } from './ProcessApiRequest';
import {
    assertArray,
    assertObject,
    assertOptionalString,
    assertString,
} from '../validation';

export class GetVisitHistoryRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_visit_history';
    }

    get method() {
        return 'GET';
    }

    getMockFailureKey() {
        return this.params.phone;
    }

    buildProcessParams() {
        return {
            phone: String(this.params.phone || ''),
        };
    }

    buildMockResponse() {
        const phone = String(this.params.phone || '');

        return {
            buttons:
                phone === 'empty'
                    ? []
                    : [
                          {
                              text: '#132 12.05.2026',
                              cssclass: 'list_item',
                              ID: '132',
                          },
                          {
                              text: '#112 10.05.2026',
                              cssclass: 'list_item',
                              ID: '112',
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
        assertObject(response, 'getVisitHistory.response');
        assertArray(response.buttons, 'getVisitHistory.response.buttons');

        response.buttons.forEach((button, index) => {
            const path = `getVisitHistory.response.buttons[${index}]`;
            assertObject(button, path);
            assertString(button.text, `${path}.text`);
            assertOptionalString(button.cssclass, `${path}.cssclass`);
            assertString(button.ID, `${path}.ID`);
        });
    }
}
