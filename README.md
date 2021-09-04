# Como usar?

## 1- Baixe o projeto e instale as dependências

```bash
# Clone o projeto usando:
$ git clone git@github.com:cassiompf/rails-gemfile-update.git

# Entre na pasta do projeto:
$ cd ./rails-gemfile-update

# Instale as dependências:
$ npm install
```

## 2- Como configurar?

Para atualizar o seu arquivo Gemfile você precisará fazer uma cópia do seu arquivo para
dentro da pasta do projeto com o caminho: `./src/assets`. O nome do arquivo deve ser `Gemfile`

## 3- Após configurar, o que devo fazer?

Após fazer a configuração explicada anteriormente, basta executar o seguinte comando
na pasta do projeto:

```bash
# Execute o seguinte comando na raiz do projeto:
$ npm run dev
```

Agora o seu `Gemfile` será gerado na pasta `./dist/Gemfile` dentro do projeto.
