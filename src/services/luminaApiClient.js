const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

/**
 * Cliente HTTP com Cookie Jar em memória para atender à autenticação Stateful (HttpOnly)
 * do backend Spring Boot Lumina, reaproveitando sessões e realizando login transparente.
 */
class LuminaApiClient {
  constructor() {
    this.baseUrl = (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/+$/, '');
    this.serviceEmail = process.env.SERVICE_EMAIL || 'john@doe.com';
    this.servicePassword = process.env.SERVICE_PASSWORD || '123456';

    this.jar = new CookieJar();
    this.client = wrapper(axios.create({
      jar: this.jar,
      withCredentials: true,
      timeout: 6000, // Timeout seguro abaixo dos 8s da Alexa
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }));

    this.isLoggedIn = false;
    this.loginPromise = null;
  }

  /**
   * Realiza o login no backend e captura o cookie HttpOnly 'authToken' no CookieJar.
   */
  async login() {
    if (this.loginPromise) {
      return this.loginPromise;
    }

    this.loginPromise = (async () => {
      try {
        console.log(`[LuminaApiClient] Realizando login no backend em: ${this.baseUrl}/usuarios/login`);
        const response = await this.client.post(`${this.baseUrl}/usuarios/login`, {
          email: this.serviceEmail,
          senha: this.servicePassword
        });

        if (response.status === 200) {
          this.isLoggedIn = true;
          console.log(`[LuminaApiClient] Login realizado com sucesso. Cookie capturado no CookieJar.`);
          return true;
        }
      } catch (error) {
        this.isLoggedIn = false;
        console.error(`[LuminaApiClient] Erro durante login no backend:`, error.response?.data || error.message);
        throw error;
      } finally {
        this.loginPromise = null;
      }
    })();

    return this.loginPromise;
  }

  /**
   * Executa uma requisição HTTP autenticada injetando o cookie de sessão e o X-Alexa-User-Id.
   */
  async request(method, path, data = null, alexaUserId = null) {
    if (!this.isLoggedIn) {
      await this.login();
    }

    const url = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const headers = {};
    if (alexaUserId) {
      headers['X-Alexa-User-Id'] = alexaUserId;
    }

    try {
      const response = await this.client({
        method,
        url,
        data,
        headers
      });
      return response.data;
    } catch (error) {
      // Se a sessão expirou (HTTP 401), refaz login e tenta mais uma vez
      if (error.response && error.response.status === 401) {
        console.warn(`[LuminaApiClient] Sessão expirada (401). Renovando autenticação...`);
        this.isLoggedIn = false;
        await this.login();

        const retryResponse = await this.client({
          method,
          url,
          data,
          headers
        });
        return retryResponse.data;
      }

      throw error;
    }
  }

  /**
   * Vincula o dispositivo Alexa à conta do dentista usando o PIN de 6 dígitos.
   */
  async vincularPin(codigo, alexaUserId, apiEndpoint) {
    const url = `${this.baseUrl}/alexa/vincular`;
    console.log(`[LuminaApiClient] Enviando pareamento de PIN para: ${url}`);
    
    // O endpoint /alexa/vincular é público e valida o PIN
    const response = await this.client.post(url, {
      codigo: codigo.replace(/\s+/g, ''),
      alexaUserId,
      apiEndpoint: apiEndpoint || 'https://api.amazonalexa.com'
    });

    return response.data;
  }

  /**
   * Obtém a próxima consulta do dentista vinculado.
   */
  async getProximaConsulta(alexaUserId) {
    return this.request('GET', '/consultas/proxima', null, alexaUserId);
  }

  /**
   * Obtém o resumo das consultas do dia do dentista vinculado.
   */
  async getConsultasHoje(alexaUserId) {
    return this.request('GET', '/consultas/hoje', null, alexaUserId);
  }

  /**
   * Obtém os alertas médicos e alergias da anamnese do próximo paciente.
   */
  async getAlertaAnamnese(alexaUserId) {
    return this.request('GET', '/consultas/proxima/anamnese', null, alexaUserId);
  }
}

// Exporta instância singleton para que o CookieJar persista entre invocações quentes da Lambda
module.exports = new LuminaApiClient();
