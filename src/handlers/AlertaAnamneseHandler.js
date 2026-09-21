const Alexa = require('ask-sdk-core');
const luminaApiClient = require('../services/luminaApiClient');

const AlertaAnamneseHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AlertaAnamneseIntent';
  },
  async handle(handlerInput) {
    const alexaUserId = handlerInput.requestEnvelope.context?.System?.user?.userId;
    console.log(`[AlertaAnamneseIntent] Consulta solicitada por: ${alexaUserId}`);

    try {
      const response = await luminaApiClient.getAlertaAnamnese(alexaUserId);
      const speakOutput = response.mensagemVoz || 'Não foram identificados alertas médicos para o próximo paciente.';

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('Posso te ajudar com mais alguma informação?')
        .getResponse();

    } catch (error) {
      console.error('[AlertaAnamneseIntent] Erro:', error.response?.data || error.message);

      if (error.response?.status === 404 && error.response?.data?.message?.includes('não vinculado')) {
        const speakOutput = 'Este dispositivo ainda não está vinculado. Por favor, acesse o painel web para gerar o código de pareamento.';
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
      }

      const speakOutput = 'Não foi possível consultar os dados de anamnese no momento. Por favor, tente novamente mais tarde.';
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

module.exports = AlertaAnamneseHandler;
