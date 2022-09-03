# Api Routes no Next

Algo revolucionario no frontend foi o "backward no frontend" (Serverless) oferecido pelo Next. Sabemos que, no frontend, nenhuma informação está totalmente segura, ou seja, api keys e endereços de serviços são visiveis e podem ser utilizadas de forma errada por pessoas mal intencionadas.

Como o Next roda um servidor node não acessivel, é possivel criar as chamadas api routes - ambientes temporarios e isolados

# Estratégias de Autenticação

Em uma aplicação com um backend, a autenticação é realizada por meio de sessões, a qual armazena informações do usuario e o token (com refresh). Temos também o login externo através de outro serviço como Google e Github, o qual pode ser implementado facilmente usando o Next Auth. Alem desses, temos serviços responsaveis por realizar todo o processo de armazenamento de credenciais e gerar o token.

# Parametrização nas rotas

Ao nomear arquivos com `[id]`, por exemplo, podemo acesse-lo, na api do Next, através de `request.query`. Outro possibilidade é `users/[...params]`, que obtém tudo após `user/`.
