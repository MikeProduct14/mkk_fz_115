import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import { registerFonts } from './fonts'

registerFonts()

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 55,
    color: '#1a1a1a',
    lineHeight: 1.5,
  },
  // Титульная страница
  titlePage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleGrif: {
    fontSize: 9,
    textAlign: 'right',
    alignSelf: 'flex-end',
    marginBottom: 60,
    color: '#374151',
    lineHeight: 1.6,
  },
  titleOrgName: {
    fontSize: 12,
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: 40,
    color: '#374151',
  },
  titleDocName: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 8,
    color: '#111827',
  },
  titleDocSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    color: '#374151',
    marginBottom: 60,
  },
  titleEdition: {
    fontSize: 10,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 80,
  },
  titleFooter: {
    fontSize: 10,
    textAlign: 'center',
    color: '#374151',
    marginTop: 'auto',
  },
  // Заголовки разделов
  h1: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 18,
    marginBottom: 8,
    color: '#111827',
  },
  h2: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 6,
    color: '#1e3a5f',
  },
  // Текст
  p: {
    fontSize: 10,
    marginBottom: 6,
    textAlign: 'justify',
  },
  // Нумерованный список
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  listNum: {
    fontSize: 10,
    width: 22,
    color: '#374151',
    fontWeight: 500,
  },
  listText: {
    flex: 1,
    fontSize: 10,
    textAlign: 'justify',
  },
  // Ненумерованный список
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 10,
    width: 14,
    color: '#374151',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
  },
  // Разделитель
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginVertical: 10,
  },
  // Блок с подчёркиванием (для подписей)
  signatureBlock: {
    marginTop: 20,
  },
  signatureRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  signatureLabel: {
    fontSize: 10,
    width: 160,
    color: '#374151',
  },
  signatureLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    marginHorizontal: 8,
    paddingBottom: 2,
    fontSize: 10,
  },
  signatureHint: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 2,
  },
  // Таблица рисков
  table: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableCell: {
    padding: 6,
    fontSize: 9,
  },
  tableCellHeader: {
    padding: 6,
    fontSize: 9,
    fontWeight: 700,
    color: '#374151',
  },
  col1: { width: '5%' },
  col2: { width: '35%' },
  col3: { width: '35%' },
  col4: { width: '25%' },
  // Выделенный блок
  highlightBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#1e40af',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginVertical: 6,
  },
  highlightText: {
    fontSize: 9,
    color: '#1e3a5f',
    fontWeight: 500,
  },
  // Футер
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 55,
    right: 55,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
})

interface Organization {
  name: string
  inn: string
  org_type: string
  address: string | null
  sdl_name: string | null
  sdl_position: string | null
  pvk_updated_at: string | null
}

interface PvkDocumentProps {
  organization: Organization
}

function fmtDate(v: string | null | undefined) {
  if (!v) return '«____» ____________ 20__ г.'
  return `«${new Date(v).getDate().toString().padStart(2, '0')}» ${
    new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(v))
  } ${new Date(v).getFullYear()} г.`
}

function ListItem({ n, children }: { n: string; children: string }) {
  return (
    <View style={styles.listItem}>
      <Text style={styles.listNum}>{n}.</Text>
      <Text style={styles.listText}>{children}</Text>
    </View>
  )
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bulletItem}>
      <Text style={styles.bullet}>—</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  )
}

export function PvkDocument({ organization }: PvkDocumentProps) {
  const year = new Date().getFullYear()
  const updatedAt = fmtDate(organization.pvk_updated_at)

  return (
    <Document
      title={`ПВК — ${organization.name}`}
      author={organization.name}
      subject="Правила внутреннего контроля в целях ПОД/ФТ"
      creator="Compliance MFO"
    >

      {/* === СТРАНИЦА 1: Титульный лист === */}
      <Page size="A4" style={styles.page}>
        <View style={styles.titlePage}>
          <Text style={styles.titleGrif}>
            УТВЕРЖДАЮ{'\n'}
            Руководитель {organization.org_type}{'\n'}
            {organization.name}{'\n'}
            {'_________________________'}{'\n'}
            {updatedAt}
          </Text>

          <Text style={styles.titleOrgName}>
            {organization.org_type} «{organization.name}»
          </Text>

          <Text style={styles.titleDocName}>
            ПРАВИЛА ВНУТРЕННЕГО КОНТРОЛЯ
          </Text>
          <Text style={styles.titleDocSubtitle}>
            в целях противодействия легализации (отмыванию) доходов,{'\n'}
            полученных преступным путём, финансированию терроризма{'\n'}
            и финансированию распространения оружия массового уничтожения
          </Text>

          <Text style={styles.titleEdition}>
            Редакция {year} года
          </Text>

          <Text style={styles.titleFooter}>
            {organization.address || '________________________, ' + year}
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{organization.name} • ПВК • ФЗ-115</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            `Стр. ${pageNumber} / ${totalPages}`
          } />
        </View>
      </Page>

      {/* === СТРАНИЦА 2+: Содержание ПВК === */}
      <Page size="A4" style={styles.page}>

        <Text style={styles.h1}>1. ОБЩИЕ ПОЛОЖЕНИЯ</Text>

        <Text style={styles.p}>
          1.1. Настоящие Правила внутреннего контроля (далее — ПВК) разработаны в соответствии
          с Федеральным законом от 07.08.2001 № 115-ФЗ «О противодействии легализации
          (отмыванию) доходов, полученных преступным путём, и финансированию терроризма»
          (далее — Федеральный закон № 115-ФЗ) и Постановлением Правительства Российской
          Федерации от 30.06.2012 № 667.
        </Text>
        <Text style={styles.p}>
          1.2. Настоящие ПВК устанавливают порядок осуществления внутреннего контроля
          в {organization.org_type} «{organization.name}» (ИНН: {organization.inn},
          далее — Организация) в целях противодействия легализации (отмыванию) доходов,
          полученных преступным путём, финансированию терроризма (далее — ПОД/ФТ).
        </Text>
        <Text style={styles.p}>
          1.3. Ответственным за реализацию ПВК является специальное должностное лицо
          (СДЛ){organization.sdl_name ? ` — ${organization.sdl_name}` : ''},
          {organization.sdl_position ? ` ${organization.sdl_position}` : ''}.
        </Text>
        <Text style={styles.p}>
          1.4. Все сотрудники Организации, участвующие в обслуживании клиентов, обязаны
          соблюдать требования настоящих ПВК.
        </Text>

        <View style={styles.divider} />
        <Text style={styles.h1}>2. ПРОГРАММА ИДЕНТИФИКАЦИИ КЛИЕНТОВ</Text>

        <Text style={styles.h2}>2.1. Обязательная идентификация</Text>
        <Text style={styles.p}>
          Организация обязана до приёма на обслуживание идентифицировать клиента —
          физическое лицо. Идентификация проводится при первом обращении и при каждом
          изменении идентификационных данных клиента.
        </Text>

        <Text style={styles.h2}>2.2. Сведения, подлежащие установлению (физическое лицо)</Text>
        <ListItem n="1">Фамилия, имя, отчество (при наличии)</ListItem>
        <ListItem n="2">Гражданство</ListItem>
        <ListItem n="3">Дата и место рождения</ListItem>
        <ListItem n="4">Реквизиты документа, удостоверяющего личность (серия, номер, кем и когда выдан, код подразделения)</ListItem>
        <ListItem n="5">Адрес места регистрации (жительства)</ListItem>
        <ListItem n="6">ИНН (при наличии)</ListItem>
        <ListItem n="7">СНИЛС (при наличии)</ListItem>

        <Text style={styles.h2}>2.3. Проверка по перечням и спискам</Text>
        <Text style={styles.p}>
          Организация обязана проверить клиента на причастность к террористической
          деятельности путём сверки с перечнями Росфинмониторинга (fedsfm.ru) и
          проверки действительности документа, удостоверяющего личность, через
          сервисы МВД России.
        </Text>
        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            Выдача займа клиенту, включённому в перечень Росфинмониторинга, ЗАПРЕЩЕНА.
            О выявленном факте Организация обязана незамедлительно уведомить Росфинмониторинг.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{organization.name} • ПВК • ФЗ-115</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            `Стр. ${pageNumber} / ${totalPages}`
          } />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>

        <Text style={styles.h1}>3. ПРОГРАММА ОЦЕНКИ РИСКА КЛИЕНТОВ</Text>

        <Text style={styles.p}>
          Организация присваивает каждому клиенту степень риска на основании
          совокупности идентификационных данных и иных сведений.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.col1]}>№</Text>
            <Text style={[styles.tableCellHeader, styles.col2]}>Критерий</Text>
            <Text style={[styles.tableCellHeader, styles.col3]}>Признаки</Text>
            <Text style={[styles.tableCellHeader, styles.col4]}>Группа риска</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.col1]}>1</Text>
            <Text style={[styles.tableCell, styles.col2]}>Стандартный клиент</Text>
            <Text style={[styles.tableCell, styles.col3]}>Гражданин РФ, цель займа стандартная, нет ПЭП-статуса</Text>
            <Text style={[styles.tableCell, styles.col4]}>Низкий</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.col1]}>2</Text>
            <Text style={[styles.tableCell, styles.col2]}>Повышенный контроль</Text>
            <Text style={[styles.tableCell, styles.col3]}>Иностранное гражданство, нестандартная цель займа, косвенные признаки</Text>
            <Text style={[styles.tableCell, styles.col4]}>Средний</Text>
          </View>
          <View style={styles.tableRowLast}>
            <Text style={[styles.tableCell, styles.col1]}>3</Text>
            <Text style={[styles.tableCell, styles.col2]}>Высокий риск</Text>
            <Text style={[styles.tableCell, styles.col3]}>ПЭП-статус, гражданство высокорисковой страны, отказ объяснять источник средств</Text>
            <Text style={[styles.tableCell, styles.col4]}>Высокий</Text>
          </View>
        </View>

        <Text style={styles.h2}>3.1. Публично значимые лица (ПЭП)</Text>
        <Text style={styles.p}>
          К публично значимым лицам относятся: иностранные публичные должностные лица,
          должностные лица публичных международных организаций, российские публичные
          должностные лица, а также их супруги и близкие родственники.
        </Text>
        <Text style={styles.p}>
          При выявлении ПЭП-статуса Организация обязана:
        </Text>
        <Bullet>принять решение об установлении деловых отношений с разрешения руководителя;</Bullet>
        <Bullet>применять меры по углублённой идентификации;</Bullet>
        <Bullet>на постоянной основе обновлять имеющиеся сведения.</Bullet>

        <View style={styles.divider} />
        <Text style={styles.h1}>4. ПРОГРАММА ВЫЯВЛЕНИЯ ОПЕРАЦИЙ, ПОДЛЕЖАЩИХ ОБЯЗАТЕЛЬНОМУ КОНТРОЛЮ</Text>

        <Text style={styles.p}>
          Организация обязана направлять сведения в Росфинмониторинг об операциях,
          подлежащих обязательному контролю в соответствии со ст. 6 Федерального закона № 115-ФЗ,
          в том числе:
        </Text>
        <Bullet>операции с денежными средствами на сумму 1 000 000 рублей и выше;</Bullet>
        <Bullet>операции по счетам (вкладам) клиентов из перечней ФНМ;</Bullet>
        <Bullet>иные операции при наличии признаков связи с террористической деятельностью.</Bullet>

        <Text style={styles.p}>
          Сведения направляются не позднее 3 рабочих дней со дня совершения операции.
        </Text>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{organization.name} • ПВК • ФЗ-115</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            `Стр. ${pageNumber} / ${totalPages}`
          } />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>

        <Text style={styles.h1}>5. ПРОГРАММА ХРАНЕНИЯ ДОКУМЕНТОВ И СВЕДЕНИЙ</Text>

        <Text style={styles.p}>
          5.1. Организация обязана хранить документы, полученные в ходе идентификации
          клиентов, а также сведения об операциях, в течение не менее пяти лет со дня
          прекращения отношений с клиентом.
        </Text>
        <Text style={styles.p}>
          5.2. Документы хранятся в электронном виде в защищённой информационной
          системе с ограниченным доступом, а также при необходимости на бумажных носителях.
        </Text>
        <Text style={styles.p}>
          5.3. Доступ к хранящимся сведениям ограничен кругом уполномоченных лиц,
          определённых руководителем Организации.
        </Text>

        <View style={styles.divider} />
        <Text style={styles.h1}>6. ПРОГРАММА ПОДГОТОВКИ КАДРОВ</Text>

        <Text style={styles.p}>
          6.1. Организация обеспечивает регулярное обучение сотрудников, участвующих
          в проведении идентификации клиентов и контроле операций, в области ПОД/ФТ.
        </Text>
        <Text style={styles.p}>
          6.2. Вводный инструктаж проводится при приёме на работу; плановое обучение —
          не реже одного раза в год.
        </Text>
        <Text style={styles.p}>
          6.3. Ответственным за организацию обучения является СДЛ.
        </Text>

        <View style={styles.divider} />
        <Text style={styles.h1}>7. ОТВЕТСТВЕННОСТЬ ЗА НАРУШЕНИЕ ТРЕБОВАНИЙ ПВК</Text>

        <Text style={styles.p}>
          7.1. Нарушение требований ФЗ-115 влечёт ответственность в соответствии
          с законодательством Российской Федерации, в том числе административную
          (штраф до 1 000 000 рублей для юридических лиц).
        </Text>
        <Text style={styles.p}>
          7.2. Нарушение сотрудниками Организации требований настоящих ПВК влечёт
          дисциплинарную ответственность в соответствии с трудовым законодательством.
        </Text>

        <View style={styles.divider} />
        <Text style={styles.h1}>8. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ</Text>

        <Text style={styles.p}>
          8.1. Настоящие ПВК вступают в силу с даты их утверждения руководителем
          Организации и подлежат пересмотру не реже одного раза в год.
        </Text>
        <Text style={styles.p}>
          8.2. Дата последнего обновления: {updatedAt}
        </Text>
        <Text style={styles.p}>
          8.3. По всем вопросам применения настоящих ПВК следует обращаться к СДЛ.
        </Text>

        <View style={styles.divider} />

        {/* Блок подписей */}
        <View style={styles.signatureBlock}>
          <Text style={[styles.h2, { marginTop: 10 }]}>Подписи ответственных лиц</Text>

          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>Руководитель Организации:</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureHint}>подпись / расшифровка / дата</Text>
            </View>
          </View>

          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>
              СДЛ{organization.sdl_name ? ` (${organization.sdl_name})` : ''}:
            </Text>
            <View style={{ flex: 1 }}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureHint}>подпись / расшифровка / дата</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{organization.name} • ПВК • ФЗ-115</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            `Стр. ${pageNumber} / ${totalPages}`
          } />
        </View>
      </Page>

    </Document>
  )
}
