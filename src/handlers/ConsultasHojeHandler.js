const Alexa = require('ask-sdk-core');
const luminaApiClient = require('../services/luminaApiClient');

const ConsultasHojeHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConsultasHojeIntent';
  },
  async handle(handlerInput) {
    const alexaUserId = handlerInput.requestEnvelope.context?.System?.user?.userId;
    console.log(`[ConsultasHojeIntent] Consulta solicitada por: ${alexaUserId}`);

    try {
      const response = await luminaApiClient.getConsultasHoje(alexaUserId);
      const speakOutput = response.mensagemVoz || 'Não encontrei consultas agendadas para hoje.';

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('Deseja consultar os alertas médicos do próximo paciente?')
        .getResponse();

    } catch (error) {
      console.error('[ConsultasHojeIntent] Erro:', error.response?.data || error.message);

      if (error.response?.status === 404 && error.response?.data?.message?.includes('não vinculado')) {
        const speakOutput = 'Este dispositivo ainda não está vinculado a uma conta Lumina. Por favor, acesse o painel web, gere um código e diga: vincular código, seguido dos números.';
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
      }

      const speakOutput = 'Desculpe, não consegui obter a sua agenda de hoje. Por favor, tente novamente em instantes.';
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

module.exports = ConsultasHojeHandler;
