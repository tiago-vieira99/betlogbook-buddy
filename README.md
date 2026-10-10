# BetLogger

Website para registar bankrolls e apostas, ver equipas, jogos, streaks e insights.

## Arrancar o site com Docker

O site corre num container Docker e liga-se às tuas APIs que estão a correr no PC:
- `localhost:8880` → API principal (bankrolls, apostas, streaks, insights)
- `localhost:8090` → API de equipas e jogos

Garante que as duas APIs estão ligadas antes de abrir o site.

### 1. Construir a imagem (só na primeira vez, ou se mudares o Dockerfile)

Na pasta do projeto:

```sh
docker build -t betlogger .
```

### 2. Arrancar o container

**Windows / Mac:**

```sh
docker run -d --name betlogger -p 5173:5173 -v "$(pwd)":/app betlogger
```

**Linux** (precisa do `--add-host` para chegar às APIs no PC):

```sh
docker run -d --name betlogger -p 5173:5173 --add-host=host.docker.internal:host-gateway -v "$(pwd)":/app betlogger
```

> No Windows com PowerShell usa `${PWD}` em vez de `$(pwd)`.

O primeiro arranque demora um pouco (instala dependências e prepara o site).
Depois abre: **http://localhost:5173**

No iPhone (na mesma rede Wi-Fi): `http://<IP-do-PC>:5173`

### 3. Comandos úteis

| O que queres fazer | Comando |
| --- | --- |
| Ver se está a correr | `docker ps` |
| Ver os logs | `docker logs -f betlogger` |
| Parar | `docker stop betlogger` |
| Voltar a arrancar | `docker start betlogger` |
| Aplicar alterações novas do código | `docker restart betlogger` |
| Apagar o container | `docker rm -f betlogger` |

**Importante:** o site corre em modo normal (não de desenvolvimento), por isso as alterações ao código só aparecem depois de `docker restart betlogger`.

### Modo de desenvolvimento (opcional)

Se quiseres que o site atualize sozinho a cada alteração ao código (mas com o reload ao voltar ao browser no iPhone):

```sh
docker run -d --name betlogger-dev -p 5173:5173 -v "$(pwd)":/app betlogger sh -c "npm install && npm run dev -- --host"
```

## Sem Docker

```sh
npm install
npm run build
npm run preview
```
