# MNLK Link Manager

Crie uma aplicação web SaaS profissional chamada MNLK, um encurtador de URLs.

O domínio futuro da aplicação será mnlk.com.br.

CONCEITO DA MARCA

MNLK é uma plataforma moderna de encurtamento e gerenciamento de URLs.

O nome MNLK representa uma conexão sutil com a marca Maiza Novais, mas a identidade visual deve funcionar como uma marca tecnológica independente.

A aparência deve transmitir:

tecnologia

confiança

organização

simplicidade

profissionalismo

modernidade

Não criar aparência infantil, excessivamente colorida ou genérica.

PALETA DE CORES

Criar uma identidade visual inspirada na família de cores da Maiza Novais, porém adaptada para tecnologia.

Cor principal — Verde profundo
#1B4D3E

Cor secundária — Verde petróleo
#27665A

Cor de destaque — Dourado elegante
#B58A3A

Cor clara de apoio — Creme
#F7F3EC

Cor de fundo — Off-white
#FCFBF8

Cor de texto principal — Grafite
#202522

Cor de texto secundário — Cinza
#66706B

Usar o verde profundo como principal identidade da plataforma.

Usar o dourado apenas como detalhe de destaque, por exemplo:

pequenos elementos de interface

ícones

bordas selecionadas

indicadores

detalhes do logotipo

Não usar dourado em grandes áreas.

A interface deve ter bastante espaço em branco, contraste adequado e aparência premium.

LOGOTIPO

Criar uma marca textual simples:

MNLK

Preferência por tipografia sans-serif moderna, forte e limpa.

O logotipo deve funcionar tanto horizontalmente quanto em uma versão compacta para favicon.

Não criar símbolo excessivamente complexo.

PÁGINA INICIAL

Título principal:

Encurte seus links. Acompanhe seus cliques.

Subtítulo:

Crie URLs curtas, organize seus links e acompanhe o desempenho de cada acesso em um único lugar.

Campo principal:

Cole sua URL

Botão:

Encurtar URL

Também apresentar:

Entrar

Criar conta

Adicionar uma demonstração visual simples mostrando:

URL original → URL curta → quantidade de cliques

CADASTRO E LOGIN

Criar:

cadastro com nome, e-mail e senha

login

recuperação de senha

sessão autenticada

proteção das páginas privadas

Cada usuário deve visualizar e administrar somente seus próprios links.

DASHBOARD

Criar um painel moderno.

Topo:
Olá, [nome]

Cards:

Total de links

Total de cliques

Links criados

Cliques recentes

Área principal:

Meus Links

Cada registro deve apresentar:

nome do link

URL original

URL encurtada

data de criação

número de cliques

botão copiar

editar

excluir

Adicionar botão:

+ Novo link

CRIAÇÃO DO LINK

O usuário cola uma URL original e o sistema gera um código curto e único.

Exemplo:

URL original:
https://exemplo.com/produto/oferta

URL curta:
https://mnlk.com.br/a8K29

Permitir opcionalmente criar um código personalizado:

https://mnlk.com.br/oferta

Validar se o código personalizado está disponível.

REDIRECIONAMENTO

Quando alguém acessar:

mnlk.com.br/a8K29

o sistema deve:

localizar a URL original

registrar o clique

redirecionar o visitante para o destino

ESTATÍSTICAS

Registrar:

total de cliques

data e hora do clique

Preparar a arquitetura para futuramente registrar:

dispositivo

navegador

país

origem/referenciador

cliques por dia

cliques por semana

cliques por mês

Criar visualização simples de estatísticas no dashboard.

BANCO DE DADOS

Preparar a aplicação para utilizar Supabase.

Estruturar tabelas para:

users

id

nome

email

created_at

links

id

user_id

original_url

short_code

custom_alias

created_at

updated_at

total_clicks

active

clicks

id

link_id

clicked_at

user_agent

referer

Aplicar regras de segurança para que cada usuário tenha acesso somente aos seus próprios registros.

RESPONSIVIDADE

O sistema deve funcionar perfeitamente em:

computador

notebook

tablet

celular

Criar navegação adaptada para telas pequenas.

EXPERIÊNCIA DO USUÁRIO

A plataforma deve ser extremamente simples.

Um usuário que nunca utilizou um encurtador deve conseguir:

criar conta

colar um link

clicar em Encurtar

copiar o link

voltar depois e ver quantos cliques recebeu

ESTRUTURA FUTURA

Preparar a arquitetura para futuramente adicionar:

QR Code

links personalizados

pastas

importação de vários links

gráficos avançados

planos gratuitos e pagos

limites por plano

página pública de estatísticas

domínio personalizado

IMPORTANTE:

Não criar apenas uma landing page ou protótipo visual.

Criar a estrutura real da aplicação SaaS, preparada para autenticação, banco de dados, geração de URLs curtas, redirecionamento e contagem de cliques.

O projeto deverá posteriormente ser publicado na Hostinger Business Web Hosting utilizando o domínio:

mnlk.com.br

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/86b28bbe-6309-41bf-af04-c71f968e0678).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
