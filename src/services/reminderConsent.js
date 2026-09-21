/**
 * Utilitário para verificar permissões de lembretes e emitir card de consentimento da Alexa.
 */
const REMINDERS_PERMISSION = 'alexa::alerts:reminders:skill:readwrite';

function hasRemindersPermission(handlerInput) {
  const permissions = handlerInput.requestEnvelope.context?.System?.user?.permissions;
  return !!(permissions && (permissions.consentToken || permissions.scopes?.[REMINDERS_PERMISSION]?.status === 'GRANTED'));
}

function askForRemindersPermission(responseBuilder, speakOutput) {
  const speech = speakOutput || 
    'Para que eu possa te enviar alertas de consultas 10 minutos antes, por favor autorize a permissão de lembretes no aplicativo da Alexa.';

  return responseBuilder
    .speak(speech)
    .withAskForPermissionsConsentCard([REMINDERS_PERMISSION])
    .getResponse();
}

module.exports = {
  REMINDERS_PERMISSION,
  hasRemindersPermission,
  askForRemindersPermission
};
