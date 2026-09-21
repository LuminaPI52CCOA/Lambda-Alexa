const Alexa = require('ask-sdk-core');
const luminaApiClient = require('../services/luminaApiClient');

const ProximaConsultaHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ProximaConsultaIntent';
  },
  async handle(handlerInput) {
    const alexaUserId = handlerInput.requestEnvelope.context?.System?.user?.userId;
    console.log(`[ProximaConsultaIntent] Consulta solicitada por: ${alexaUserId}`);

    try {
      const response = await luminaApiClient.getProximaConsulta(alexaUserId);
      const speakOutput = response.mensagemVoz || 'Não encontrei dados da sua próxima consulta.';

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('Você gostaria de mais alguma informação, como as consultas de hoje?')
        .getResponse();

    } catch (error) {
      console.error('[ProximaConsultaIntent] Erro:', error.response?.data || error.message);

      if (error.response?.status === 404 && error.response?.data?.message?.includes('não vinculado')) {
        const speakOutput = 'Este dispositivo ainda não está vinculado a uma conta Lumina. Por favor, acesse o painel web, gere um código e diga: vincular código, seguido dos números.';
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
      }

      const speakOutput = 'Desculpe, não consegui obter sua próxima consulta agora. Por favor, tente novamente em instantes.';
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

module.exports = ProximaConsultaHandler;
