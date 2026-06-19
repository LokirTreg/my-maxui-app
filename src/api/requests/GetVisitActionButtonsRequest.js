import { ProcessApiRequest } from './ProcessApiRequest';
import { normalizeId } from './normalizeId';
import {
    assertArray,
    assertObject,
    assertOptionalString,
    assertString,
} from '../validation';

const normalizeButton = (button, index) => ({
    ...button,
    title: String(
        button.title ?? button.text ?? button.label ?? `Действие ${index + 1}`
    ),
});

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
                    type: 'callback',
                },
                {
                    title: 'Перенести время',
                    cssclass: 'btn_green',
                    callback: `/change-time?tvsid=${id}`,
                    type: 'route',
                },
                {
                    title: 'Отметить прибытие',
                    cssclass: 'btn_green',
                    callback: `method=mark_arrival&tvsid=${id}`,
                    type: 'callback',
                },
            ],
        };
    }

    transformEnvelopeData(data) {
        if (Array.isArray(data)) {
            return {
                buttons: data.map(normalizeButton),
            };
        }

        return {
            ...data,
            buttons: (data?.buttons || []).map(normalizeButton),
        };
    }

    validateResponse(response) {
        assertObject(response, 'getVisitActionButtons.response');
        assertArray(response.buttons, 'getVisitActionButtons.response.buttons');

        response.buttons.forEach((button, index) => {
            const path = `getVisitActionButtons.response.buttons[${index}]`;
            assertObject(button, path);
            assertString(button.title, `${path}.title`, { allowEmpty: false });
            assertOptionalString(button.cssclass, `${path}.cssclass`);
            assertString(button.callback, `${path}.callback`, {
                allowEmpty: false,
            });
            assertString(button.type, `${path}.type`, { allowEmpty: false });
        });
    }
}
