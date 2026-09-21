const Alexa = require('ask-sdk-core');

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Você pode me perguntar: qual a minha próxima consulta, quantas consultas tenho hoje, ou se o próximo paciente tem alguma alergia. Caso seja seu primeiro acesso, diga: vincular código, seguido dos seis dígitos gerados no seu painel web. Como posso ajudar agora?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('Você pode perguntar qual a sua próxima consulta.')
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Até logo, Doutor! Um ótimo atendimento.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Desculpe, não consegui compreender o comando. Você pode perguntar: qual a minha próxima consulta, quantas consultas tenho hoje, ou pedir ajuda.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('Diga: qual a minha próxima consulta?')
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`[SessionEnded] Motivo: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`[ErrorHandler] Erro capturado na execução da Skill:`, error.stack || error);

    const speakOutput = 'Desculpe, ocorreu uma falha ao processar sua solicitação no sistema Lumina. Por favor, tente novamente em alguns instantes.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

module.exports = {
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  FallbackIntentHandler,
  SessionEndedRequestHandler,
  ErrorHandler
};
