const Alexa = require('ask-sdk-core');
const luminaApiClient = require('../services/luminaApiClient');
const { hasRemindersPermission, askForRemindersPermission } = require('../services/reminderConsent');

const VincularIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'VincularDispositivoIntent';
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const codigoSlot = slots?.codigo?.value;

    if (!codigoSlot) {
      const speakOutput = 'Não consegui entender o código. Por favor, repita dizendo: vincular código, seguido dos seis números gerados no painel web.';
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('Diga: vincular código, seguido dos números.')
        .getResponse();
    }

    const alexaUserId = handlerInput.requestEnvelope.context?.System?.user?.userId;
    const apiEndpoint = handlerInput.requestEnvelope.context?.System?.apiEndpoint;

    console.log(`[VincularIntent] Tentando vincular PIN [${codigoSlot}] para alexaUserId [${alexaUserId}]`);

    try {
      const resultado = await luminaApiClient.vincularPin(codigoSlot, alexaUserId, apiEndpoint);
      const dentistaNome = resultado.dentistaNome || 'Doutor';

      const temPermissaoLembretes = hasRemindersPermission(handlerInput);

      if (!temPermissaoLembretes) {
        const mensagemComCard = `Dispositivo conectado com sucesso ao Doutor ${dentistaNome}! Enviei um cartão para o seu aplicativo da Alexa. Ative a permissão de lembretes para receber os avisos de consultas 10 minutos antes. O que você gostaria de saber agora?`;
        return askForRemindersPermission(handlerInput.responseBuilder, mensagemComCard);
      }

      const speakOutput = `Dispositivo conectado com sucesso ao Doutor ${dentistaNome}! Agora você já pode perguntar qual a sua próxima consulta ou pedir o resumo do dia. O que deseja consultar?`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('Você pode perguntar: qual a minha próxima consulta?')
        .getResponse();

    } catch (error) {
      console.error('[VincularIntent] Erro ao vincular:', error.response?.data || error.message);
      
      let speakOutput = 'Não foi possível vincular seu dispositivo. ';
      if (error.response?.status === 400 || error.response?.data?.message?.includes('expirado')) {
        speakOutput += 'O código informado expirou. Por favor, gere um novo código no painel web da Lumina e tente novamente.';
      } else if (error.response?.status === 404 || error.response?.data?.message?.includes('inválido')) {
        speakOutput += 'O código informado não foi encontrado. Verifique os números no painel e tente novamente.';
      } else {
        speakOutput += 'Houve uma falha de comunicação com o sistema Lumina. Verifique sua conexão e tente novamente.';
      }

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

module.exports = VincularIntentHandler;
