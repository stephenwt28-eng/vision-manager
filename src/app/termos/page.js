import Link from "next/link";

const companyName = "Vision Manager";
const developerName = "BitBloom AI";
const supportEmail = "bitbloomai@gmail.com";
const lastUpdate = "14 de maio de 2026";

export const metadata = {
  title: "Termos de Responsabilidade e Política de Privacidade | Vision Manager",
  description:
    "Termos de responsabilidade, uso da plataforma e política de privacidade do Vision Manager.",
};

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-slate-200 py-8">
      <h2 className="text-2xl font-black tracking-[-0.04em] text-[#1B1464]">
        {title}
      </h2>

      <div className="mt-4 space-y-4 text-[15px] leading-8 text-slate-700">
        {children}
      </div>
    </section>
  );
}

function Paragraph({ children }) {
  return <p>{children}</p>;
}

function List({ children }) {
  return (
    <ul className="ml-5 list-disc space-y-2 marker:text-[#6f58cc]">
      {children}
    </ul>
  );
}

export default function TermsAndPrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f7fb] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-slate-200 pb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/"
                className="inline-flex text-sm font-black uppercase tracking-[0.18em] text-[#6f58cc] transition hover:text-[#5539c4]"
              >
                {companyName}
              </Link>

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.075em] text-[#1B1464] sm:text-5xl lg:text-6xl">
                Termos de Responsabilidade e Política de Privacidade
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                Este documento apresenta as condições de uso da plataforma, as
                responsabilidades dos usuários e as práticas relacionadas à
                privacidade, segurança e tratamento de dados pessoais.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
          <aside className="hidden lg:block">
            <div className="sticky top-8 border-l border-slate-200 pl-5">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Navegação
              </p>

              <nav className="space-y-3 text-sm font-bold text-slate-600">
                <a className="block transition hover:text-[#6f58cc]" href="#introducao">
                  1. Introdução
                </a>
                <a className="block transition hover:text-[#6f58cc]" href="#aceite">
                  2. Aceite dos termos
                </a>
                <a className="block transition hover:text-[#6f58cc]" href="#plataforma">
                  3. Sobre a plataforma
                </a>
                <a className="block transition hover:text-[#6f58cc]" href="#responsabilidades">
                  4. Responsabilidades
                </a>
                <a className="block transition hover:text-[#6f58cc]" href="#dados">
                  5. Dados tratados
                </a>
                <a className="block transition hover:text-[#6f58cc]" href="#privacidade">
                  6. Privacidade
                </a>
                <a className="block transition hover:text-[#6f58cc]" href="#seguranca">
                  7. Segurança
                </a>
                <a className="block transition hover:text-[#6f58cc]" href="#direitos">
                  8. Direitos do titular
                </a>
                <a className="block transition hover:text-[#6f58cc]" href="#cookies">
                  9. Cookies
                </a>
                <a className="block transition hover:text-[#6f58cc]" href="#contato">
                  10. Contato
                </a>
              </nav>
            </div>
          </aside>

          <article className="bg-white px-5 py-8 shadow-[0_42px_120px_-80px_rgba(15,23,42,0.5)] sm:px-8 lg:px-12">
            <div className="mb-8 border-b border-slate-200 pb-8">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#6f58cc]">
                Documento institucional
              </p>

              <p className="mt-4 text-[15px] leading-8 text-slate-700">
                Ao acessar ou utilizar o {companyName}, o usuário declara estar
                ciente e de acordo com as condições descritas neste documento.
                Caso não concorde com qualquer disposição, recomenda-se não
                utilizar a plataforma.
              </p>
            </div>

            <Section id="introducao" title="1. Introdução">
              <Paragraph>
                O {companyName} é uma plataforma desenvolvida para auxiliar
                óticas na organização de clientes, ordens de serviço, envelopes
                digitais, receitas, documentos, vendedores, atendimentos,
                relatórios e demais rotinas administrativas.
              </Paragraph>

              <Paragraph>
                Este documento reúne os Termos de Responsabilidade e a Política
                de Privacidade da plataforma, explicando de forma clara como o
                sistema deve ser utilizado, quais são as responsabilidades dos
                usuários e como os dados pessoais podem ser tratados no ambiente
                digital.
              </Paragraph>

              <Paragraph>
                A plataforma foi desenvolvida por {developerName}, podendo ser
                licenciada, personalizada ou disponibilizada para uso por óticas,
                empresas, administradores, funcionários e demais usuários
                autorizados.
              </Paragraph>
            </Section>

            <Section id="aceite" title="2. Aceite dos termos">
              <Paragraph>
                O uso do {companyName} implica a leitura, compreensão e aceitação
                integral destes termos. O aceite pode ocorrer por meio do acesso
                à plataforma, criação de conta, login, utilização de módulos,
                cadastro de informações ou qualquer interação com o sistema.
              </Paragraph>

              <Paragraph>
                O usuário declara que as informações fornecidas são verdadeiras,
                completas e atualizadas, responsabilizando-se por dados
                incorretos, incompletos, desatualizados ou inseridos sem a
                devida autorização.
              </Paragraph>

              <Paragraph>
                A empresa contratante ou responsável pela ótica deverá garantir
                que seus colaboradores, operadores e administradores conheçam as
                regras de uso da plataforma e utilizem o sistema de acordo com a
                legislação aplicável.
              </Paragraph>
            </Section>

            <Section id="plataforma" title="3. Sobre a plataforma">
              <Paragraph>
                O {companyName} tem como objetivo centralizar e organizar
                informações operacionais da ótica, reduzindo a dependência de
                papéis, envelopes físicos, controles manuais e registros
                espalhados em diferentes canais.
              </Paragraph>

              <Paragraph>
                Entre as funcionalidades que podem estar disponíveis na
                plataforma estão:
              </Paragraph>

              <List>
                <li>cadastro e gerenciamento de clientes;</li>
                <li>registro de ordens de serviço;</li>
                <li>controle de status de pedidos;</li>
                <li>armazenamento de receitas, anexos e documentos;</li>
                <li>gestão de vendedores e funcionários;</li>
                <li>relatórios administrativos e indicadores de desempenho;</li>
                <li>controle de acesso por perfil de usuário;</li>
                <li>consulta de histórico de atendimento e compras;</li>
                <li>organização de informações relacionadas ao balcão e à gestão.</li>
              </List>

              <Paragraph>
                As funcionalidades podem variar conforme o plano contratado, a
                personalização realizada, a fase de implantação ou as permissões
                concedidas a cada usuário.
              </Paragraph>
            </Section>

            <Section id="responsabilidades" title="4. Responsabilidades do usuário">
              <Paragraph>
                O usuário é responsável por utilizar a plataforma de forma ética,
                segura, profissional e compatível com a finalidade do sistema.
              </Paragraph>

              <Paragraph>
                São responsabilidades do usuário:
              </Paragraph>

              <List>
                <li>manter sigilo sobre seu login, senha e credenciais de acesso;</li>
                <li>não compartilhar sua conta com terceiros;</li>
                <li>inserir apenas informações verdadeiras e necessárias;</li>
                <li>respeitar a privacidade dos clientes cadastrados;</li>
                <li>utilizar os dados apenas para finalidades legítimas da ótica;</li>
                <li>não acessar informações sem autorização;</li>
                <li>não copiar, exportar ou compartilhar dados indevidamente;</li>
                <li>não tentar burlar permissões, bloqueios ou camadas de segurança;</li>
                <li>comunicar imediatamente qualquer suspeita de acesso indevido;</li>
                <li>cumprir as orientações internas da empresa contratante.</li>
              </List>

              <Paragraph>
                O uso indevido da plataforma poderá resultar em suspensão de
                acesso, bloqueio de conta, exclusão de permissões e adoção das
                medidas administrativas, contratuais ou legais cabíveis.
              </Paragraph>
            </Section>

            <Section id="responsabilidade-empresa" title="5. Responsabilidades da empresa contratante">
              <Paragraph>
                A empresa contratante, ótica ou responsável pelo uso da
                plataforma é responsável pela gestão interna dos usuários,
                concessão de permissões, definição dos dados cadastrados e
                orientação dos colaboradores.
              </Paragraph>

              <Paragraph>
                Cabe à empresa contratante:
              </Paragraph>

              <List>
                <li>definir quem poderá acessar a plataforma;</li>
                <li>conceder permissões compatíveis com a função de cada usuário;</li>
                <li>revogar acessos de colaboradores desligados ou sem autorização;</li>
                <li>orientar sua equipe sobre privacidade e confidencialidade;</li>
                <li>obter autorizações necessárias para tratamento de dados de clientes;</li>
                <li>garantir que os dados cadastrados tenham finalidade legítima;</li>
                <li>responder por informações inseridas por seus usuários autorizados;</li>
                <li>solicitar suporte em caso de inconsistências ou incidentes.</li>
              </List>

              <Paragraph>
                A plataforma é uma ferramenta de organização e gestão. As
                decisões comerciais, administrativas, financeiras, operacionais
                e de atendimento continuam sendo de responsabilidade da empresa
                contratante.
              </Paragraph>
            </Section>

            <Section id="limitacoes" title="6. Limitações de responsabilidade">
              <Paragraph>
                O {companyName} não substitui a análise humana, a conferência
                profissional, a responsabilidade administrativa da ótica ou a
                validação dos dados inseridos pelos usuários.
              </Paragraph>

              <Paragraph>
                A plataforma poderá apresentar interrupções temporárias em razão
                de manutenção, atualizações, falhas de conexão, indisponibilidade
                de provedores externos, incidentes técnicos ou situações fora do
                controle razoável da empresa desenvolvedora.
              </Paragraph>

              <Paragraph>
                A empresa desenvolvedora não se responsabiliza por:
              </Paragraph>

              <List>
                <li>dados inseridos incorretamente pelos usuários;</li>
                <li>uso indevido das informações cadastradas;</li>
                <li>compartilhamento não autorizado de senhas;</li>
                <li>falhas causadas por conexão de internet do usuário;</li>
                <li>decisões comerciais tomadas com base em dados não conferidos;</li>
                <li>perdas decorrentes de má utilização da plataforma;</li>
                <li>uso do sistema em desacordo com estes termos;</li>
                <li>descumprimento de normas internas da empresa contratante.</li>
              </List>
            </Section>

            <Section id="dados" title="7. Dados pessoais tratados">
              <Paragraph>
                Para funcionamento da plataforma, poderão ser cadastrados e
                tratados dados pessoais relacionados a clientes, funcionários,
                administradores e usuários autorizados.
              </Paragraph>

              <Paragraph>
                Os dados tratados podem incluir, conforme o uso realizado pela
                ótica:
              </Paragraph>

              <List>
                <li>nome completo;</li>
                <li>telefone;</li>
                <li>e-mail;</li>
                <li>CPF ou documento de identificação, quando aplicável;</li>
                <li>endereço;</li>
                <li>histórico de compras e atendimentos;</li>
                <li>informações de ordens de serviço;</li>
                <li>dados de receitas ópticas cadastradas;</li>
                <li>anexos e documentos enviados à plataforma;</li>
                <li>informações de vendedores ou responsáveis pelo atendimento;</li>
                <li>registros de acesso e ações realizadas no sistema.</li>
              </List>

              <Paragraph>
                A plataforma deve ser utilizada apenas para dados necessários à
                finalidade de gestão da ótica. Informações excessivas,
                desnecessárias ou sem relação com a operação não devem ser
                cadastradas.
              </Paragraph>
            </Section>

            <Section id="finalidade" title="8. Finalidade do tratamento de dados">
              <Paragraph>
                Os dados cadastrados no {companyName} podem ser utilizados para:
              </Paragraph>

              <List>
                <li>identificar clientes e usuários;</li>
                <li>organizar atendimentos e ordens de serviço;</li>
                <li>registrar histórico de compras e solicitações;</li>
                <li>facilitar a localização de documentos e receitas;</li>
                <li>melhorar o atendimento no balcão;</li>
                <li>acompanhar prazos, entregas e status de pedidos;</li>
                <li>gerar relatórios gerenciais;</li>
                <li>controlar acessos e permissões;</li>
                <li>garantir segurança e rastreabilidade das operações;</li>
                <li>cumprir obrigações legais, contratuais ou regulatórias.</li>
              </List>

              <Paragraph>
                O tratamento de dados deverá observar a finalidade legítima,
                necessidade, transparência, segurança e demais princípios
                previstos na legislação aplicável.
              </Paragraph>
            </Section>

            <Section id="privacidade" title="9. Política de Privacidade">
              <Paragraph>
                A privacidade dos usuários e clientes cadastrados é tratada como
                parte essencial do funcionamento da plataforma. O {companyName}
                adota medidas técnicas e organizacionais para proteger os dados
                contra acessos não autorizados, perda, alteração, divulgação
                indevida ou uso incompatível com a finalidade do sistema.
              </Paragraph>

              <Paragraph>
                O acesso às informações poderá ser limitado de acordo com o
                perfil do usuário, separando permissões administrativas,
                operacionais e de balcão. Essa separação busca reduzir exposição
                desnecessária de dados e manter cada usuário dentro do escopo de
                sua função.
              </Paragraph>

              <Paragraph>
                A empresa contratante deverá orientar seus colaboradores sobre o
                uso correto das informações, pois a segurança da plataforma
                também depende da conduta dos usuários autorizados.
              </Paragraph>
            </Section>

            <Section id="compartilhamento" title="10. Compartilhamento de dados">
              <Paragraph>
                Os dados cadastrados na plataforma não devem ser vendidos,
                alugados ou compartilhados para finalidades incompatíveis com a
                operação da ótica.
              </Paragraph>

              <Paragraph>
                O compartilhamento poderá ocorrer quando necessário para:
              </Paragraph>

              <List>
                <li>prestação de suporte técnico;</li>
                <li>armazenamento seguro em infraestrutura tecnológica;</li>
                <li>cumprimento de obrigação legal ou ordem de autoridade competente;</li>
                <li>execução de contrato entre a empresa contratante e a desenvolvedora;</li>
                <li>proteção dos direitos da empresa, usuários ou terceiros;</li>
                <li>investigação de uso indevido, fraude ou incidente de segurança.</li>
              </List>

              <Paragraph>
                Quando houver fornecedores ou serviços terceiros envolvidos,
                deverão ser adotadas medidas razoáveis para que esses parceiros
                tratem os dados de forma segura e compatível com a legislação.
              </Paragraph>
            </Section>

            <Section id="seguranca" title="11. Segurança da informação">
              <Paragraph>
                O {companyName} poderá utilizar mecanismos de segurança como
                autenticação, controle de sessão, permissões por perfil,
                registros de acesso, criptografia em trânsito, camadas de
                proteção no banco de dados e boas práticas de desenvolvimento.
              </Paragraph>

              <Paragraph>
                Apesar das medidas adotadas, nenhum sistema digital é
                absolutamente imune a riscos. Por isso, a segurança depende
                também de boas práticas dos usuários, como uso de senhas fortes,
                não compartilhamento de acessos e encerramento de sessões em
                computadores compartilhados.
              </Paragraph>

              <Paragraph>
                Em caso de suspeita de incidente de segurança, acesso indevido
                ou vazamento de informações, o usuário deverá comunicar
                imediatamente a empresa responsável pela plataforma ou o canal de
                suporte indicado neste documento.
              </Paragraph>
            </Section>

            <Section id="direitos" title="12. Direitos dos titulares de dados">
              <Paragraph>
                Nos termos da legislação aplicável, os titulares de dados
                pessoais podem solicitar informações sobre o tratamento de seus
                dados, incluindo confirmação de tratamento, acesso, correção,
                atualização, anonimização, bloqueio, eliminação ou demais
                direitos previstos em lei.
              </Paragraph>

              <Paragraph>
                As solicitações devem ser encaminhadas ao responsável pela ótica
                ou empresa contratante, que avaliará o pedido conforme sua
                responsabilidade como controladora dos dados, quando aplicável.
              </Paragraph>

              <Paragraph>
                Quando a empresa desenvolvedora atuar apenas como prestadora de
                tecnologia ou operadora de dados, poderá encaminhar solicitações
                ao controlador responsável ou auxiliá-lo tecnicamente, conforme
                o contrato firmado entre as partes.
              </Paragraph>
            </Section>

            <Section id="retencao" title="13. Retenção e exclusão de dados">
              <Paragraph>
                Os dados poderão ser mantidos enquanto forem necessários para a
                execução da finalidade para a qual foram coletados, para o
                cumprimento de obrigações legais ou regulatórias, para exercício
                regular de direitos ou conforme necessidade operacional da ótica.
              </Paragraph>

              <Paragraph>
                A exclusão de dados poderá ser solicitada pela empresa
                contratante, respeitados os limites técnicos, legais,
                contratuais e de segurança aplicáveis.
              </Paragraph>

              <Paragraph>
                Determinadas informações poderão permanecer armazenadas por
                prazo adicional quando necessárias para auditoria, prevenção de
                fraudes, cumprimento de obrigações legais ou proteção de direitos.
              </Paragraph>
            </Section>

            <Section id="cookies" title="14. Cookies e tecnologias similares">
              <Paragraph>
                A plataforma poderá utilizar cookies, armazenamento local ou
                tecnologias similares para manter a sessão do usuário, melhorar a
                experiência de navegação, lembrar preferências, reforçar a
                segurança e compreender o funcionamento técnico do sistema.
              </Paragraph>

              <Paragraph>
                O usuário pode configurar seu navegador para bloquear cookies,
                mas isso poderá afetar o funcionamento de recursos essenciais,
                como login, autenticação e permanência da sessão.
              </Paragraph>
            </Section>

            <Section id="acessos" title="15. Login, senha e controle de acesso">
              <Paragraph>
                Cada usuário deverá acessar a plataforma com credenciais próprias.
                O compartilhamento de login e senha é proibido, pois compromete
                a rastreabilidade das ações realizadas no sistema.
              </Paragraph>

              <Paragraph>
                A empresa contratante deverá revisar periodicamente os acessos
                ativos, removendo usuários que não façam mais parte da equipe ou
                que não necessitem mais acessar a plataforma.
              </Paragraph>

              <Paragraph>
                A plataforma poderá registrar informações relacionadas a login,
                data, horário, ações realizadas e outros elementos necessários
                para segurança e auditoria.
              </Paragraph>
            </Section>

            <Section id="propriedade" title="16. Propriedade intelectual">
              <Paragraph>
                O layout, código, estrutura, marca, textos, identidade visual,
                funcionalidades, fluxos, componentes, telas e demais elementos da
                plataforma pertencem à empresa desenvolvedora ou aos respectivos
                titulares de direitos.
              </Paragraph>

              <Paragraph>
                É proibido copiar, vender, sublicenciar, reproduzir, distribuir,
                modificar ou explorar comercialmente qualquer parte da plataforma
                sem autorização expressa.
              </Paragraph>

              <Paragraph>
                O uso da plataforma não transfere ao usuário ou à empresa
                contratante qualquer direito de propriedade intelectual, exceto o
                direito limitado de uso conforme contrato, licença ou autorização
                aplicável.
              </Paragraph>
            </Section>

            <Section id="alteracoes" title="17. Alterações deste documento">
              <Paragraph>
                Estes Termos de Responsabilidade e Política de Privacidade podem
                ser atualizados periodicamente para refletir mudanças legais,
                técnicas, operacionais ou comerciais.
              </Paragraph>

              <Paragraph>
                Quando houver alterações relevantes, a empresa poderá comunicar
                os usuários por meio da própria plataforma, e-mail, aviso interno
                ou outro canal adequado.
              </Paragraph>

              <Paragraph>
                A continuidade do uso da plataforma após a publicação de
                alterações será considerada como ciência e concordância com a
                versão atualizada do documento.
              </Paragraph>
            </Section>

            <Section id="legislacao" title="18. Legislação aplicável">
              <Paragraph>
                Este documento será interpretado de acordo com a legislação
                brasileira, especialmente as normas relacionadas à proteção de
                dados pessoais, relações contratuais, responsabilidade civil,
                segurança da informação e demais regras aplicáveis ao uso de
                plataformas digitais.
              </Paragraph>

              <Paragraph>
                Eventuais controvérsias deverão ser solucionadas preferencialmente
                de forma amigável. Não sendo possível, poderão ser adotados os
                meios legais cabíveis, conforme contrato firmado entre as partes
                ou legislação aplicável.
              </Paragraph>
            </Section>

            <Section id="contato" title="19. Canal de contato">
              <Paragraph>
                Para dúvidas, solicitações, comunicações sobre privacidade,
                pedidos relacionados a dados pessoais ou relatos de incidentes,
                entre em contato pelo canal abaixo:
              </Paragraph>

              <div className="mt-5 border-l-4 border-[#6f58cc] bg-[#6f58cc]/[0.06] px-5 py-4">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#6f58cc]">
                  Contato
                </p>
                <p className="mt-2 text-base font-bold text-[#1B1464]">
                  {supportEmail}
                </p>
              </div>

              <Paragraph>
                Caso exista um encarregado de dados indicado pela empresa
                contratante, as solicitações relacionadas à privacidade também
                poderão ser direcionadas a esse responsável.
              </Paragraph>
            </Section>

            <footer className="mt-10 border-t border-slate-200 pt-8">
              <p className="text-sm leading-7 text-slate-500">
                Este documento é um modelo institucional e deve ser adaptado à
                realidade jurídica, operacional e contratual da empresa que
                utilizará o {companyName}.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center bg-[#6f58cc] px-5 text-sm font-black text-white transition hover:bg-[#5539c4]"
                >
                  Voltar para o site
                </Link>

                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center border border-slate-300 bg-white px-5 text-sm font-black text-[#1B1464] transition hover:border-[#6f58cc]/40 hover:text-[#6f58cc]"
                >
                  Entrar na plataforma
                </Link>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </main>
  );
}