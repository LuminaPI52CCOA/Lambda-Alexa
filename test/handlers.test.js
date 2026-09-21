const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const LaunchRequestHandler = require('../src/handlers/LaunchRequestHandler');
const VincularIntentHandler = require('../src/handlers/VincularIntentHandler');
const ProximaConsultaHandler = require('../src/handlers/ProximaConsultaHandler');
const ConsultasHojeHandler = require('../src/handlers/ConsultasHojeHandler');
const AlertaAnamneseHandler = require('../src/handlers/AlertaAnamneseHandler');
const { HelpIntentHandler, CancelAndStopIntentHandler } = require('../src/handlers/StandardHandlers');
const luminaApiClient = require('../src/services/luminaApiClient');

describe('Testes da AWS Lambda Lumina Alexa', () => {

  test('Interaction Model pt-BR.json deve ser um JSON válido com todos os Intents', () => {
    const modelPath = path.join(__dirname, '../skill-package/interactionModels/custom/pt-BR.json');
    const content = fs.readFileSync(modelPath, 'utf8');
    const json = JSON.parse(content);

    assert.ok(json.interactionModel);
    assert.strictEqual(json.interactionModel.languageModel.invocationName, 'lumina');

    const intentNames = json.interactionModel.languageModel.intents.map(i => i.name);
    assert.ok(intentNames.includes('ProximaConsultaIntent'));
    assert.ok(intentNames.includes('ConsultasHojeIntent'));
    assert.ok(intentNames.includes('AlertaAnamneseIntent'));
    assert.ok(intentNames.includes('VincularDispositivoIntent'));
    assert.ok(intentNames.includes('AMAZON.HelpIntent'));
    assert.ok(intentNames.includes('AMAZON.StopIntent'));
  });

  test('LuminaApiClient deve expor os métodos principais', () => {
    assert.strictEqual(typeof luminaApiClient.login, 'function');
    assert.strictEqual(typeof luminaApiClient.vincularPin, 'function');
    assert.strictEqual(typeof luminaApiClient.getProximaConsulta, 'function');
    assert.strictEqual(typeof luminaApiClient.getConsultasHoje, 'function');
    assert.strictEqual(typeof luminaApiClient.getAlertaAnamnese, 'function');
  });

  test('LaunchRequestHandler canHandle deve validar tipo LaunchRequest', () => {
    const inputLaunch = {
      requestEnvelope: {
        request: { type: 'LaunchRequest' }
      }
    };
    const inputIntent = {
      requestEnvelope: {
        request: { type: 'IntentRequest', intent: { name: 'ProximaConsultaIntent' } }
      }
    };

    assert.strictEqual(LaunchRequestHandler.canHandle(inputLaunch), true);
    assert.strictEqual(LaunchRequestHandler.canHandle(inputIntent), false);
  });

  test('VincularIntentHandler canHandle deve validar VincularDispositivoIntent', () => {
    const input = {
      requestEnvelope: {
        request: {
          type: 'IntentRequest',
          intent: { name: 'VincularDispositivoIntent' }
        }
      }
    };

    assert.strictEqual(VincularIntentHandler.canHandle(input), true);
  });

  test('ProximaConsultaHandler canHandle deve validar ProximaConsultaIntent', () => {
    const input = {
      requestEnvelope: {
        request: {
          type: 'IntentRequest',
          intent: { name: 'ProximaConsultaIntent' }
        }
      }
    };

    assert.strictEqual(ProximaConsultaHandler.canHandle(input), true);
  });

  test('ConsultasHojeHandler canHandle deve validar ConsultasHojeIntent', () => {
    const input = {
      requestEnvelope: {
        request: {
          type: 'IntentRequest',
          intent: { name: 'ConsultasHojeIntent' }
        }
      }
    };

    assert.strictEqual(ConsultasHojeHandler.canHandle(input), true);
  });

  test('AlertaAnamneseHandler canHandle deve validar AlertaAnamneseIntent', () => {
    const input = {
      requestEnvelope: {
        request: {
          type: 'IntentRequest',
          intent: { name: 'AlertaAnamneseIntent' }
        }
      }
    };

    assert.strictEqual(AlertaAnamneseHandler.canHandle(input), true);
  });

  test('StandardHandlers devem responder adequadamente a Help e Stop', () => {
    const inputHelp = {
      requestEnvelope: {
        request: { type: 'IntentRequest', intent: { name: 'AMAZON.HelpIntent' } }
      }
    };
    const inputStop = {
      requestEnvelope: {
        request: { type: 'IntentRequest', intent: { name: 'AMAZON.StopIntent' } }
      }
    };

    assert.strictEqual(HelpIntentHandler.canHandle(inputHelp), true);
    assert.strictEqual(CancelAndStopIntentHandler.canHandle(inputStop), true);
  });
});
