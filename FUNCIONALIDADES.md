# Documentação de Funcionalidades - Sistema Dk Sind

## Visão Geral

Este documento detalha as funcionalidades das diferentes telas e componentes do sistema de gestão sindical Dk Sind. O sistema é dividido em duas áreas principais: o **Painel do Administrador** e a **Área do Associado**.

---

## 1. Estrutura Geral e Acesso

### 1.1. `Página Inicial (/)`
- **Função:** Redireciona o usuário para a tela de login (`/login`). É o ponto de entrada do sistema.
- **Tecnologia:** Next.js `redirect`.

### 1.2. `Login (/login)`
- **Função:** Permite que administradores e associados acessem o sistema com suas credenciais. A tela adapta-se para cada tipo de usuário.
- **Recursos:**
    - Formulário de autenticação.
    - Links para recuperação de senha e cadastro (se aplicável).

### 1.3. `Layouts`
- **`layout.tsx` (Raiz):**
    - Define a estrutura HTML base para todas as páginas.
    - Carrega a fonte principal (Inter), o CSS global e o `AuthProvider` para gerenciamento de sessão.
    - Configura metadados essenciais para SEO e PWA (Progressive Web App).
- **`admin/layout.tsx` (Administrador):**
    - Estrutura o painel administrativo, incluindo a barra lateral (`AdminSidebar`).
    - Adiciona um fundo dinâmico e efeitos visuais para uma interface moderna.
    - Define o layout principal onde o conteúdo de cada página de administração é renderizado.

---

## 2. Painel do Administrador (`/admin`)

### 2.1. `Dashboard (/admin/dashboard)`
- **Função:** Tela principal do administrador, oferecendo uma visão geral e consolidada das operações do sindicato.
- **Recursos:**
    - **Header:** Saudação, barra de busca global para associados e protocolos, e um ícone de notificações.
    - **Grid de Estatísticas:**
        - **Associados:** Número total de membros.
        - **Receita Fluxo:** Receita mensal atual.
        - **Taxa Saúde:** Número de membros ativos/adimplentes.
        - **Alertas:** Número de membros com pendências.
    - **Tabela de Movimentação Recente:**
        - Exibe as últimas cobranças geradas, mostrando o associado, data, valor e status (Liquidado/Pendente).
        - Permite acesso rápido aos detalhes da transação.
    - **Metas do Ciclo:**
        - Gráfico de progresso que compara a arrecadação atual com a meta mensal definida nas configurações.
        - Mostra o valor restante para atingir a meta.
    - **Ações Rápidas:** Botões de atalho para "Novo Associado", "Lançar Cobrança", "Configurações" e "Segurança".
    - **ONLINE:** Monitoramento em tempo real dos associados que estão navegando no portal, exibindo última atividade e permitindo contato rápido via WhatsApp.

### 2.2. `CRM WhatsApp (/admin/whatsapp)`
- **Função:** Uma central de relacionamento completa integrada ao WhatsApp para comunicação direta com os associados.
- **Recursos:**
    - **Conexão com a API:**
        - Botão para conectar/desconectar da API do WhatsApp.
        - Exibição de QR Code para autenticação.
        - Indicador de status da conexão (Conectado/Desconectado).
        - **Sistema de Auto-reconexão:** Um serviço de verificação (health check) roda a cada 30 segundos para garantir que a conexão com o WhatsApp esteja sempre ativa, tentando reconectar automaticamente em caso de falha.
    - **Lista de Conversas:**
        - Exibe todas as conversas ativas, mostrando o nome do associado (se vinculado) ou o número.
        - Campo de busca para filtrar conversas por nome, número ou matrícula.
        - Botão para "Iniciar Nova Conversa" com um número que ainda não está na lista.
    - **Área de Chat:**
        - Exibe o histórico de mensagens da conversa selecionada.
        - Suporte para envio e visualização de texto, imagens, vídeos, áudios e documentos.
        - Identificação de mensagens enviadas por administradores.
        - **Notificações no Navegador:** O sistema solicita permissão e exibe uma notificação no desktop quando uma nova mensagem chega.
    - **Envio de Mensagens:**
        - Campo para digitar texto.
        - Botão para anexar arquivos do computador.
    - **Vínculo com Associado:**
        - Se uma conversa é com um número não identificado, um botão "Associar ao Cadastro" permite vincular aquele número a um associado existente através da matrícula ou CPF.

### 2.3. `Configurações (/admin/settings)`
- **Função:** Painel central para configurar todos os aspectos do sistema, desde a identidade visual até integrações e automações.
- **Abas de Configuração:**
    - **Sindicato:**
        - Nome oficial do sindicato.
        - Upload do logo.
        - Definição da meta de arrecadação mensal.
        - Links para redes sociais (Instagram, YouTube).
    - **Página Inicial:**
        - Personalização do conteúdo do site público: título, subtítulo, estatísticas e seções de conteúdo.
        - Configuração do rodapé: endereço, email, telefone e copyright.
    - **Automático AI (Automação de Cobrança):**
        - **Ativação:** Chave para ligar/desligar a automação de mensagens.
        - **Modelos de Mensagem:** Campos para personalizar as mensagens de WhatsApp que são enviadas automaticamente:
            1.  **Cobrança Gerada:** Mensagem enviada quando uma nova fatura é criada.
            2.  **Lembrete de 3 Dias:** Mensagem para faturas com 3 dias de atraso.
            3.  **Lembrete de 15 Dias:** Mensagem para faturas com 15 dias de atraso.
        - **Botão de Teste:** Permite enviar as três mensagens de teste para um associado pré-definido para verificar a formatação e o envio.
    - **Cobranças (Integração Efí):**
        - Configuração das credenciais da API da Efí (Gerencianet) para geração de PIX: `Client ID` e `Client Secret`.
        - Modo Sandbox para testes.
    - **Carteirinha:**
        - Personalização do design da carteirinha digital do associado, como a cor primária.
        - Preview em tempo real do design.
    - **Integrações API:**
        - Configuração das credenciais da API do WhatsApp (Evolution API): URL, API Key, e nome da instância.
        - ID do Google Analytics para monitoramento de tráfego.
    - **Dados & Backup:**
        - **Exportar:** Botão para baixar um backup completo de todas as configurações e dados do sistema em um arquivo JSON.
        - **Importar:** Funcionalidade para carregar um arquivo de backup JSON para restaurar dados (sobrescreve os dados atuais).

---

## 3. Área do Associado (`/associado`)

*(Nota: A implementação detalhada da área do associado não foi totalmente explorada, mas a estrutura indica as seguintes funcionalidades.)*

### 3.1. `Dashboard do Associado (/associado/dashboard)`
- **Função:** Tela principal para o associado, onde ele pode ver suas informações e acessar os serviços.
- **Recursos Prováveis:**
    - Mensagem de boas-vindas.
    - Status de sua associação (Ativo/Inativo).
    - Acesso rápido à sua carteirinha digital.
    - Resumo de suas últimas cobranças.

### 3.2. `Cobranças do Associado (/associado/cobrancas)`
- **Função:** Permite ao associado visualizar todo o seu histórico de pagamentos.
- **Recursos Prováveis:**
    - Lista de todas as cobranças, com data de vencimento, valor e status.
    - Opção de pagar cobranças pendentes (gerando PIX Copia e Cola).
    - Download de comprovantes de pagamento.

### 3.3. `Carteirinha Digital`
- **Função:** Exibe a carteirinha de membro digital do associado.
- **Recursos:**
    - Nome, foto, número de matrícula.
    - QR Code para validação.
    - Design personalizado conforme definido pelo administrador.
