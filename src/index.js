const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = require('./handlers/LaunchRequestHandler');
const VincularIntentHandler = require('./handlers/VincularIntentHandler');
const ProximaConsultaHandler = require('./handlers/ProximaConsultaHandler');
const ConsultasHojeHandler = require('./handlers/ConsultasHojeHandler');
const AlertaAnamneseHandler = require('./handlers/AlertaAnamneseHandler');
const {
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  FallbackIntentHandler,
  SessionEndedRequestHandler,
  ErrorHandler
} = require('./handlers/StandardHandlers');

/**
 * Interceptor de requisições para auditoria e logs estruturados no CloudWatch.
 */
const RequestLoggingInterceptor = {
  process(handlerInput) {
    const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
    const userId = handlerInput.requestEnvelope.context?.System?.user?.userId;
    console.log(`[ALEXA REQUEST] Type: [${requestType}] | User: [${userId}]`);
    if (requestType === 'IntentRequest') {
      console.log(`[ALEXA INTENT] Name: [${Alexa.getIntentName(handlerInput.requestEnvelope)}]`);
    }
  }
};

/**
 * Interceptor de respostas para logging da fala gerada pela Skill.
 */
const ResponseLoggingInterceptor = {
  process(handlerInput, response) {
    const speech = response?.outputSpeech?.ssml || response?.outputSpeech?.text;
    if (speech) {
      console.log(`[ALEXA RESPONSE] OutputSpeech: ${speech}`);
    }
  }
};

/**
 * Configuração e inicialização da Skill Lumina com ASK SDK v2.
 */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    VincularIntentHandler,
    ProximaConsultaHandler,
    ConsultasHojeHandler,
    AlertaAnamneseHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(RequestLoggingInterceptor)
  .addResponseInterceptors(ResponseLoggingInterceptor)
  .lambda();
