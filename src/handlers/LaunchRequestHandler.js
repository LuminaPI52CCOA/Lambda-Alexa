const Alexa = require('ask-sdk-core');
const luminaApiClient = require('../services/luminaApiClient');
const { hasRemindersPermission, askForRemindersPermission } = require('../services/reminderConsent');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const alexaUserId = handlerInput.requestEnvelope.context?.System?.user?.userId;
    console.log(`[LaunchRequest] Recebido de alexaUserId: ${alexaUserId}`);

    try {
      // Tenta buscar a próxima consulta para verificar se este dispositivo já está vinculado
      const proxima = await luminaApiClient.getProximaConsulta(alexaUserId);

      // Dispositivo vinculado! Verifica se as permissões de lembrete já foram dadas
      const temPermissao = hasRemindersPermission(handlerInput);

      if (!temPermissao) {
        return askForRemindersPermission(
          handlerInput.responseBuilder,
          'Olá, Doutor! Bem-vindo à Lumina. Enviei um cartão no seu aplicativo Alexa para você ativar os lembretes de consultas 10 minutos antes. Como posso ajudar agora? Você pode perguntar qual a sua próxima consulta.'
        );
      }

      const speakOutput = 'Olá, Doutor! Bem-vindo à Lumina Odontológica. Como posso te ajudar hoje? Você pode perguntar: qual a minha próxima consulta, quantas consultas tenho hoje, ou se o próximo paciente tem alguma alergia.';
      const reprompt = 'Você pode dizer: qual a minha próxima consulta, ou quantas consultas tenho hoje.';

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(reprompt)
        .getResponse();

    } catch (error) {
      // Se não estiver vinculado (404)
      if (error.response?.status === 404 || error.message?.includes('não vinculado')) {
        const speakOutput = 'Olá! Bem-vindo à Lumina Odontológica. Este dispositivo Echo ainda não está conectado à sua conta. Acesse o painel web da Lumina, clique em Conectar Alexa para gerar seu código de pareamento e depois me diga: vincular código, seguido dos seis números.';
        const reprompt = 'Para conectar, gere seu código no painel da Lumina e diga: vincular código, seguido dos números.';

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(reprompt)
          .getResponse();
      }

      console.error('[LaunchRequest] Erro ao verificar status da conta:', error);
      const speakOutput = 'Olá! Bem-vindo à Lumina. Estou com dificuldades momentâneas para conectar ao servidor da clínica. Por favor, tente novamente em alguns instantes.';
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

module.exports = LaunchRequestHandler;
