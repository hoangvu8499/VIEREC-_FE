import { CheckCircle2, FileCheck2, GraduationCap, MapPin, Phone, RadioTower } from 'lucide-react'

import missionPoster from '@/assets/images/about/mission-poster.webp'
import { ButtonLink } from '@/components/common/button-link'
import { Container } from '@/components/common/container'
import { PageSection } from '@/components/shared/page-section'
import { COMPANY, CONTACT, MOTTO, SLOGAN, telHref } from '@/constants/contact'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import {
  ACTIVITY_FIELDS,
  CAPABILITIES,
  CORE_VALUES,
  DIRECTORS,
  EXPERTS,
  GALLERY,
  INTRODUCTION,
  LEGAL_DOCUMENTS,
  ORGANIZATION,
  PARTNERS,
  RESPONSE_STATIONS,
  STRATEGIC_GOALS,
} from '@/pages/about/about-data'
import type { TeamMember } from '@/types/about'
import { formatDate } from '@/utils/format-date'

import styles from './about-page.module.css'

function MemberCard({ member, large }: { member: TeamMember; large?: boolean }) {
  return (
    <li className={large ? styles.directorCard : styles.expertCard}>
      <img
        className={styles.memberPhoto}
        src={member.photo}
        alt={`Ảnh ${member.name}`}
        loading="lazy"
      />
      <div>
        <p className={styles.memberName}>{member.name}</p>
        {member.position && <p className={styles.memberPosition}>{member.position}</p>}
        <p className={styles.memberMeta}>{member.degree}</p>
        <p className={styles.memberMeta}>Chuyên ngành: {member.major}</p>
      </div>
    </li>
  )
}

export default function AboutPage() {
  useDocumentTitle('Về VIEREC')

  return (
    <>
      <section className={styles.hero} aria-labelledby="about-title">
        <Container className={styles.heroInner}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Về VIEREC</p>
            <h1 id="about-title" className={styles.heroTitle}>
              {COMPANY.NAME}
            </h1>
            <p className={styles.heroIntl}>{COMPANY.INTERNATIONAL_NAME}</p>
            <div className={styles.mission}>
              <p className={styles.missionLabel}>Sứ mệnh</p>
              <p className={styles.missionText}>{SLOGAN}.</p>
            </div>
            <div className={styles.heroActions}>
              <ButtonLink to={ROUTES.COURSES} variant="accent" size="lg">
                <GraduationCap size={22} aria-hidden />
                Khám phá khoá học
              </ButtonLink>
              <a className={styles.heroCall} href={telHref(CONTACT.HOTLINE)}>
                <Phone size={20} aria-hidden />
                Hotline {CONTACT.HOTLINE}
              </a>
            </div>
          </div>
          <img
            className={styles.heroImage}
            src={missionPoster}
            alt={`${COMPANY.NAME} – Sứ mệnh: ${SLOGAN}`}
            width={1600}
            height={1073}
          />
        </Container>
      </section>

      <PageSection id="intro-title" eyebrow="Giới thiệu" title="Giới thiệu trung tâm" white>
        <div className={styles.introGrid}>
          <div className={styles.introText}>
            {INTRODUCTION.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <aside className={styles.infoCard} aria-labelledby="info-title">
            <h3 id="info-title" className={styles.infoTitle}>
              Thông tin trung tâm
            </h3>
            <dl className={styles.infoList}>
              <div>
                <dt>Tên quốc tế</dt>
                <dd>{COMPANY.INTERNATIONAL_NAME}</dd>
              </div>
              <div>
                <dt>Trụ sở</dt>
                <dd>{COMPANY.ADDRESS}</dd>
              </div>
              <div>
                <dt>Mã số thuế</dt>
                <dd>{COMPANY.TAX_CODE}</dd>
              </div>
              <div>
                <dt>Điện thoại</dt>
                <dd>
                  <a href={telHref(CONTACT.HOTLINE)}>{CONTACT.HOTLINE}</a> hoặc{' '}
                  <a href={telHref(CONTACT.PHONE)}>{CONTACT.PHONE}</a>
                </dd>
              </div>
              <div>
                <dt>Người đại diện pháp luật</dt>
                <dd>{COMPANY.LEGAL_REPRESENTATIVE}</dd>
              </div>
              <div>
                <dt>Cơ quan quản lý trực tiếp</dt>
                <dd>{COMPANY.PARENT_COMPANY}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </PageSection>

      <PageSection id="values-title" eyebrow="Cam kết" title="Giá trị cốt lõi">
        <ul className={styles.values}>
          {CORE_VALUES.map(({ id, icon: Icon, label }) => (
            <li key={id} className={styles.value}>
              <span className={styles.valueIcon}>
                <Icon size={28} aria-hidden />
              </span>
              {label}
            </li>
          ))}
        </ul>
        <p className={styles.motto}>{MOTTO}</p>
      </PageSection>

      <PageSection id="fields-title" eyebrow="Lĩnh vực" title="Lĩnh vực hoạt động" white>
        <ul className={styles.fields}>
          {ACTIVITY_FIELDS.map((field) => (
            <li key={field}>
              <CheckCircle2 size={20} aria-hidden />
              {field}
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection id="goals-title" eyebrow="Định hướng" title="Mục tiêu chiến lược">
        <ol className={styles.goals}>
          {STRATEGIC_GOALS.map((goal, index) => (
            <li key={goal.id} className={styles.goal}>
              <span className={styles.goalNumber}>{String(index + 1).padStart(2, '0')}</span>
              <h3 className={styles.goalTitle}>{goal.title}</h3>
              <ul className={styles.goalItems}>
                {goal.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection
        id="capabilities-title"
        eyebrow="Năng lực"
        title="Năng lực và dịch vụ"
        description="Những lĩnh vực VIEREC đã và đang triển khai cho doanh nghiệp, địa phương và cộng đồng."
        white
      >
        <p className={styles.highlight}>
          <RadioTower size={28} aria-hidden />
          <span>
            <strong>{RESPONSE_STATIONS}</strong> điểm và trạm trực ứng phó sự cố tràn dầu, hoá chất
            luôn sẵn sàng ứng cứu khẩn cấp
          </span>
        </p>
        <ul className={styles.capabilities}>
          {CAPABILITIES.map((capability) => (
            <li key={capability.id} className={styles.capability}>
              <div className={styles.capabilityText}>
                <h3 className={styles.capabilityTitle}>{capability.title}</h3>
                <p>{capability.description}</p>
              </div>
              <div className={styles.capabilityPhotos}>
                {capability.photos.map((photo) => (
                  <img key={photo.src} src={photo.src} alt={photo.alt} loading="lazy" />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection id="org-title" eyebrow="Tổ chức" title="Sơ đồ tổ chức trung tâm">
        <div className={styles.org}>
          <div className={styles.orgTop}>
            <span className={styles.orgBoard}>{ORGANIZATION.top}</span>
            <span className={styles.orgAdvisory}>{ORGANIZATION.advisory}</span>
          </div>
          <ul className={styles.orgDepartments}>
            {ORGANIZATION.departments.map((department) => (
              <li key={department.name}>
                <span className={styles.orgDepartment}>{department.name}</span>
                <ul className={styles.orgUnits}>
                  {department.units.map((unit) => (
                    <li key={unit}>{unit}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </PageSection>

      <PageSection id="directors-title" eyebrow="Đội ngũ" title="Ban Giám đốc" white>
        <ul className={styles.directors}>
          {DIRECTORS.map((member) => (
            <MemberCard key={member.id} member={member} large />
          ))}
        </ul>
      </PageSection>

      <PageSection
        id="experts-title"
        eyebrow="Đội ngũ"
        title="Hội đồng chuyên gia"
        description="Các tiến sĩ, thạc sĩ trong lĩnh vực hoá học, môi trường, khoa học quân sự và công nghệ."
      >
        <ul className={styles.experts}>
          {EXPERTS.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </ul>
      </PageSection>

      <PageSection id="legal-title" eyebrow="Pháp lý" title="Hồ sơ pháp lý" white>
        <ul className={styles.legal}>
          {LEGAL_DOCUMENTS.map((document) => (
            <li key={document.id} className={styles.legalCard}>
              <FileCheck2 size={28} aria-hidden />
              <div>
                <h3 className={styles.legalTitle}>{document.title}</h3>
                <p>
                  Số: <strong>{document.number}</strong> · Đăng ký lần đầu{' '}
                  {formatDate(document.firstRegisteredAt)}
                </p>
                <p className={styles.legalIssuer}>{document.issuedBy}</p>
              </div>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection id="gallery-title" eyebrow="Hình ảnh" title="Hoạt động đào tạo, diễn tập">
        <ul className={styles.gallery}>
          {GALLERY.map((photo) => (
            <li key={photo.src}>
              <img src={photo.src} alt={photo.alt} loading="lazy" />
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection id="partners-title" eyebrow="Đối tác" title="Đối tác đồng hành" white>
        <ul className={styles.partners}>
          {PARTNERS.map((partner) => (
            <li key={partner}>{partner}</li>
          ))}
        </ul>
      </PageSection>

      <section className={styles.contact} aria-labelledby="contact-title">
        <Container className={styles.contactInner}>
          <div>
            <h2 id="contact-title" className={styles.contactTitle}>
              Liên hệ với VIEREC
            </h2>
            <p className={styles.contactAddress}>
              <MapPin size={18} aria-hidden /> {COMPANY.ADDRESS}
            </p>
          </div>
          <div className={styles.contactActions}>
            <a className={styles.contactPhone} href={telHref(CONTACT.HOTLINE)}>
              <Phone size={20} aria-hidden /> {CONTACT.HOTLINE}
            </a>
            <a className={styles.contactPhone} href={telHref(CONTACT.PHONE)}>
              <Phone size={20} aria-hidden /> {CONTACT.PHONE}
            </a>
          </div>
        </Container>
      </section>
    </>
  )
}
