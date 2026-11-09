import { Handshake, Leaf, ShieldCheck, Target, Users } from 'lucide-react'

import chemicalLab from '@/assets/images/about/chemical-lab.webp'
import chemicalStorage from '@/assets/images/about/chemical-storage.webp'
import consultingConference from '@/assets/images/about/consulting-conference.webp'
import consultingMeeting from '@/assets/images/about/consulting-meeting.webp'
import drillHazmat from '@/assets/images/about/drill-hazmat.webp'
import drillShipDanang from '@/assets/images/about/drill-ship-danang.webp'
import drillWaterSpray from '@/assets/images/about/drill-water-spray.webp'
import lightningPlant from '@/assets/images/about/lightning-plant.webp'
import lightningTanks from '@/assets/images/about/lightning-tanks.webp'
import oilBoomBoats from '@/assets/images/about/oil-boom-boats.webp'
import researchComputer from '@/assets/images/about/research-computer.webp'
import researchInstrument from '@/assets/images/about/research-instrument.webp'
import responseBoat from '@/assets/images/about/response-boat.webp'
import responseFireTruck from '@/assets/images/about/response-fire-truck.webp'
import responseHazmat from '@/assets/images/about/response-hazmat.webp'
import teamHelmets from '@/assets/images/about/team-helmets.webp'
import trainingClass from '@/assets/images/about/training-class.webp'
import trainingCpr from '@/assets/images/about/training-cpr.webp'
import trainingPetrolimex from '@/assets/images/about/training-petrolimex.webp'
import trainingPractice from '@/assets/images/about/training-practice.webp'
import doanVanCu from '@/assets/images/team/doan-van-cu.webp'
import hoVinhHoa from '@/assets/images/team/ho-vinh-hoa.webp'
import leDucAnh from '@/assets/images/team/le-duc-anh.webp'
import leThiHongNhung from '@/assets/images/team/le-thi-hong-nhung.webp'
import leXuanVan from '@/assets/images/team/le-xuan-van.webp'
import lyLuc from '@/assets/images/team/ly-luc.webp'
import nguyenDangHoai from '@/assets/images/team/nguyen-dang-hoai.webp'
import nguyenDinhThong from '@/assets/images/team/nguyen-dinh-thong.webp'
import nguyenHongSon from '@/assets/images/team/nguyen-hong-son.webp'
import nguyenMinhHo from '@/assets/images/team/nguyen-minh-ho.webp'
import nguyenThiKimAnh from '@/assets/images/team/nguyen-thi-kim-anh.webp'
import nguyenVanPhuong from '@/assets/images/team/nguyen-van-phuong.webp'
import nguyenVanTu from '@/assets/images/team/nguyen-van-tu.webp'
import tranBaQuoc from '@/assets/images/team/tran-ba-quoc.webp'
import tranQuocTuan from '@/assets/images/team/tran-quoc-tuan.webp'
import tranThuyChi from '@/assets/images/team/tran-thuy-chi.webp'
import tranVanThanh from '@/assets/images/team/tran-van-thanh.webp'
import type {
  Capability,
  CoreValue,
  LegalDocument,
  Photo,
  StrategicGoal,
  TeamMember,
} from '@/types/about'

/** Nội dung lấy từ Hồ sơ năng lực VIEREC (10/2026). */

export const INTRODUCTION = [
  'VIEREC được Công ty Cổ phần Ứng phó sự cố khẩn cấp Việt Nam thành lập với sứ mệnh nghiên cứu khoa học và chuyển giao công nghệ trong lĩnh vực phòng ngừa, ứng phó sự cố hoá chất, tràn dầu, sự cố chất thải, bức xạ và hạt nhân, an toàn vệ sinh lao động và bảo vệ môi trường; tổ chức diễn tập, đào tạo, tập huấn, hội nghị, hội thảo và hợp tác quốc tế trong các lĩnh vực này.',
  'VIEREC quy tụ đội ngũ chuyên gia có trình độ cao, nhiều kinh nghiệm trong ứng phó sự cố môi trường, an toàn hoá chất, an toàn lao động, phòng cháy chữa cháy và cứu nạn cứu hộ.',
  'Với mục tiêu trở thành cơ sở nghiên cứu khoa học và đào tạo chất lượng cao trong lĩnh vực ứng phó sự cố môi trường và biến đổi khí hậu, VIEREC đề cao việc nâng cao năng lực con người theo phương châm “4 tại chỗ – 3 sẵn sàng”, ứng dụng kết quả nghiên cứu khoa học và công nghệ vào công tác phòng ngừa, ứng phó và khắc phục sự cố.',
  'VIEREC hướng tới xây dựng các trung tâm điều hành ứng phó sự cố tại chỗ (ICC – Incident Command Center), phối hợp chặt chẽ cùng chính quyền, doanh nghiệp và các đơn vị cung cấp dịch vụ để ứng phó kịp thời, hiệu quả với các tình huống khẩn cấp, giảm thiểu tối đa thiệt hại về người và tài sản.',
]

export const CORE_VALUES: CoreValue[] = [
  { id: 'safety', icon: ShieldCheck, label: 'Đặt an toàn lên hàng đầu' },
  { id: 'professional', icon: Handshake, label: 'Hành động chuyên nghiệp' },
  { id: 'environment', icon: Leaf, label: 'Bảo vệ môi trường – Phát triển bền vững' },
  { id: 'community', icon: Users, label: 'Đồng hành cùng doanh nghiệp và cộng đồng' },
  { id: 'standard', icon: Target, label: 'Hướng tới chuẩn mực quốc tế' },
]

export const ACTIVITY_FIELDS = [
  'Nghiên cứu khoa học; tư vấn, thiết kế, chế tạo, chuyển giao công nghệ và hợp tác quốc tế trong phòng ngừa, ứng phó sự cố hoá chất, tràn dầu, sự cố chất thải, bức xạ và hạt nhân, an toàn vệ sinh lao động và bảo vệ môi trường.',
  'Chế tạo, ứng dụng và chuyển giao công nghệ về ngăn ngừa, ứng phó và xử lý khẩn cấp các sự cố hoá chất, sự cố môi trường, sự cố chất thải, thiên tai dịch bệnh và an toàn PCCC & CNCH.',
  'Tư vấn xây dựng kế hoạch, biện pháp phòng ngừa, ứng phó, khắc phục sự cố hoá chất, tràn dầu, chất thải; nhận diện, đánh giá rủi ro an toàn, môi trường; ứng phó thiên tai và biến đổi khí hậu.',
  'Tổ chức diễn tập, đào tạo, tập huấn, hội nghị, hội thảo về an toàn hoá chất, an toàn vệ sinh lao động, an toàn kinh doanh khí và xăng dầu, an toàn bức xạ, vận chuyển hàng nguy hiểm, PCCC, cứu nạn cứu hộ và sơ cấp cứu.',
]

export const STRATEGIC_GOALS: StrategicGoal[] = [
  {
    id: 'research',
    title: 'Nghiên cứu khoa học, chuyển giao công nghệ và hợp tác quốc tế',
    items: [
      'Đẩy mạnh nghiên cứu và phát triển công nghệ trong lĩnh vực HSE, ứng phó sự cố và môi trường.',
      'Hoàn thiện và chuyển giao giải pháp, thiết bị, công nghệ phục vụ thực tiễn.',
      'Mở rộng hợp tác quốc tế, xây dựng mạng lưới đối tác khoa học, công nghệ trong và ngoài nước.',
    ],
  },
  {
    id: 'expertise',
    title: 'Phát triển năng lực chuyên môn',
    items: [
      'Trở thành đơn vị tư vấn và ứng phó sự cố hàng đầu miền Trung.',
      'Xây dựng đội ngũ chuyên gia đa ngành về HSE, hoá chất, môi trường và cứu nạn cứu hộ.',
      'Đạt các chứng nhận quản lý chất lượng và an toàn theo tiêu chuẩn quốc tế.',
    ],
  },
  {
    id: 'response',
    title: 'Nâng cao năng lực ứng phó sự cố',
    items: [
      'Thành lập lực lượng ứng cứu sự cố chuyên nghiệp hoạt động 24/7.',
      'Xây dựng trung tâm đào tạo và diễn tập ứng phó sự cố.',
      'Hình thành mạng lưới chuyên gia và đối tác hỗ trợ ứng cứu trên toàn quốc.',
    ],
  },
  {
    id: 'services',
    title: 'Phát triển dịch vụ',
    items: [
      'Tư vấn an toàn hoá chất; huấn luyện an toàn lao động và môi trường.',
      'Quan trắc môi trường lao động; đánh giá rủi ro và quản trị HSE.',
      'Xây dựng kế hoạch ứng phó sự cố hoá chất, môi trường, thiên tai; ứng cứu khẩn cấp và khắc phục hậu quả.',
    ],
  },
  {
    id: 'digital',
    title: 'Chuyển đổi số',
    items: [
      'Phát triển nền tảng quản lý an toàn và ứng phó sự cố trực tuyến.',
      'Ứng dụng AI, GIS và công nghệ số trong cảnh báo và quản lý rủi ro.',
      'Xây dựng cơ sở dữ liệu sự cố và bài học kinh nghiệm phục vụ doanh nghiệp.',
    ],
  },
]

export const CAPABILITIES: Capability[] = [
  {
    id: 'research',
    title: 'Nghiên cứu khoa học, phát triển và chuyển giao công nghệ',
    description:
      'Nghiên cứu, chuyển giao khoa học – công nghệ; tổ chức huấn luyện, đào tạo, diễn tập trong lĩnh vực phòng ngừa và ứng phó sự cố.',
    photos: [
      { src: researchInstrument, alt: 'Chuyên gia vận hành thiết bị phân tích' },
      { src: researchComputer, alt: 'Phân tích mẫu tại phòng thí nghiệm' },
    ],
  },
  {
    id: 'consulting',
    title: 'Tư vấn lập kế hoạch, biện pháp phòng ngừa, ứng phó sự cố',
    description:
      'Tư vấn chuyên sâu từ nhận diện, đánh giá rủi ro đến xây dựng kế hoạch, biện pháp và quy trình ứng phó phù hợp với từng loại hình hoạt động.',
    photos: [
      { src: consultingConference, alt: 'Hội thảo về phòng ngừa sự cố' },
      { src: oilBoomBoats, alt: 'Triển khai phao quây dầu trên biển' },
    ],
  },
  {
    id: 'training',
    title: 'Tổ chức các khoá huấn luyện và đào tạo nghiệp vụ',
    description:
      'Tập huấn, huấn luyện, đào tạo và cấp chứng nhận về phòng ngừa, ứng phó sự cố tràn dầu, hoá chất, môi trường; an toàn hoá chất, an toàn vệ sinh lao động, an toàn kinh doanh khí hoá lỏng và vận chuyển hàng nguy hiểm.',
    photos: [
      { src: trainingClass, alt: 'Lớp huấn luyện an toàn cho doanh nghiệp' },
      { src: trainingCpr, alt: 'Thực hành sơ cấp cứu' },
    ],
  },
  {
    id: 'drill',
    title: 'Tổ chức diễn tập ứng phó sự cố khẩn cấp',
    description:
      'Phối hợp với cơ quan chức năng và doanh nghiệp tổ chức diễn tập ứng phó sự cố hoá chất, tràn dầu, chất thải, thiên tai, PCCC và CNCH.',
    photos: [
      { src: drillWaterSpray, alt: 'Diễn tập phun nước trên tàu' },
      { src: drillShipDanang, alt: 'Diễn tập quây dầu trên vịnh Đà Nẵng' },
    ],
  },
  {
    id: 'response',
    title: 'Ứng trực, ứng phó và xử lý sự cố khẩn cấp',
    description:
      'Hơn 30 điểm và trạm trực ứng phó sự cố tràn dầu, hoá chất với trang thiết bị và nhân lực phù hợp tại cảng, kho, nhà máy, cửa hàng xăng dầu, khu neo đậu tàu thuyền và công trình trọng yếu, luôn sẵn sàng ứng cứu khẩn cấp.',
    photos: [
      { src: responseFireTruck, alt: 'Xe chữa cháy phun nước ứng phó sự cố' },
      { src: responseHazmat, alt: 'Ứng phó sự cố hoá chất với trang phục bảo hộ' },
    ],
  },
  {
    id: 'chemical',
    title: 'Phân loại, ghi nhãn, lập phiếu an toàn và đăng ký hoá chất mới',
    description:
      'Tư vấn phân loại, ghi nhãn hoá chất; lập phiếu an toàn hoá chất (MSDS) cho tổ chức sản xuất, nhập khẩu hoá chất nguy hiểm; thủ tục đăng ký hoá chất mới theo Luật Hoá chất.',
    photos: [
      { src: chemicalLab, alt: 'Thao tác hoá chất trong tủ hút' },
      { src: chemicalStorage, alt: 'Kiểm tra kho lưu trữ hoá chất' },
    ],
  },
  {
    id: 'lightning',
    title: 'Đo, kiểm tra hệ thống chống sét',
    description:
      'Đánh giá tình trạng kỹ thuật, khả năng tiếp địa và mức độ an toàn hệ thống chống sét cho kho tàng, nhà xưởng, công trình; phát hiện hư hỏng và đề xuất giải pháp khắc phục.',
    photos: [
      { src: lightningPlant, alt: 'Kiểm tra chống sét tại nhà máy' },
      { src: lightningTanks, alt: 'Khu bồn chứa được kiểm tra chống sét' },
    ],
  },
]

export const RESPONSE_STATIONS = '30+'

export const GALLERY: Photo[] = [
  { src: teamHelmets, alt: 'Lực lượng ứng phó sự cố tràn dầu' },
  { src: trainingPetrolimex, alt: 'Huấn luyện an toàn cho Petrolimex' },
  { src: trainingPractice, alt: 'Lễ kết thúc đợt thực tập nghiệp vụ' },
  { src: consultingMeeting, alt: 'Toạ đàm chuyên môn' },
  { src: drillHazmat, alt: 'Diễn tập xử lý tràn đổ hoá chất' },
  { src: responseBoat, alt: 'Diễn tập chữa cháy trên tàu' },
]

export const ORGANIZATION = {
  top: 'Ban Giám đốc',
  advisory: 'Hội đồng chuyên gia',
  departments: [
    {
      name: 'Phòng Đào tạo và Tư vấn',
      units: ['Ban Đào tạo và Diễn tập', 'Ban Tư vấn nghiệp vụ'],
    },
    {
      name: 'Phòng NCKH & chuyển giao công nghệ',
      units: ['Ban Nghiên cứu phát triển công nghệ', 'Phòng Thí nghiệm'],
    },
  ],
}

export const DIRECTORS: TeamMember[] = [
  {
    id: 'le-duc-anh',
    name: 'Lê Đức Anh',
    photo: leDucAnh,
    position: 'Giám đốc',
    degree: 'Thạc sĩ, NCS Tiến sĩ',
    major: 'Kỹ thuật Môi trường',
  },
  {
    id: 'nguyen-minh-ho',
    name: 'Nguyễn Minh Hổ',
    photo: nguyenMinhHo,
    position: 'Phó Giám đốc',
    degree: 'Thạc sĩ',
    major: 'Quản trị kinh doanh',
  },
  {
    id: 'tran-quoc-tuan',
    name: 'Trần Quốc Tuấn',
    photo: tranQuocTuan,
    position: 'Phó Giám đốc',
    degree: 'Thạc sĩ',
    major: 'Quản lý Tài nguyên và Môi trường',
  },
  {
    id: 'ly-luc',
    name: 'Lý Lực',
    photo: lyLuc,
    position: 'Phó Giám đốc',
    degree: 'Trung cấp',
    major: 'Kế toán',
  },
]

export const EXPERTS: TeamMember[] = [
  {
    id: 'nguyen-dinh-thong',
    name: 'Nguyễn Đình Thống',
    photo: nguyenDinhThong,
    degree: 'Tiến sĩ',
    major: 'Hoá hữu cơ',
  },
  {
    id: 'nguyen-van-tu',
    name: 'Nguyễn Văn Tú',
    photo: nguyenVanTu,
    degree: 'Tiến sĩ',
    major: 'Kỹ thuật Hoá học',
  },
  {
    id: 'tran-ba-quoc',
    name: 'Trần Bá Quốc',
    photo: tranBaQuoc,
    degree: 'Tiến sĩ',
    major: 'Kỹ thuật Môi trường',
  },
  {
    id: 'tran-van-thanh',
    name: 'Trần Văn Thanh',
    photo: tranVanThanh,
    degree: 'Tiến sĩ',
    major: 'Hoá Lý',
  },
  {
    id: 'tran-thuy-chi',
    name: 'Trần Thuỳ Chi',
    photo: tranThuyChi,
    degree: 'Tiến sĩ',
    major: 'Địa lý tự nhiên',
  },
  {
    id: 'nguyen-van-phuong',
    name: 'Nguyễn Văn Phương',
    photo: nguyenVanPhuong,
    degree: 'Tiến sĩ',
    major: 'Khoa học Quân sự',
  },
  {
    id: 'le-xuan-van',
    name: 'Lê Xuân Văn',
    photo: leXuanVan,
    degree: 'Tiến sĩ',
    major: 'Hoá hữu cơ',
  },
  {
    id: 'nguyen-hong-son',
    name: 'Nguyễn Hồng Sơn',
    photo: nguyenHongSon,
    degree: 'Thạc sĩ',
    major: 'Hoá hữu cơ',
  },
  {
    id: 'nguyen-thi-kim-anh',
    name: 'Nguyễn Thị Kim Anh',
    photo: nguyenThiKimAnh,
    degree: 'Thạc sĩ',
    major: 'Quản lý môi trường',
  },
  {
    id: 'doan-van-cu',
    name: 'Đoàn Văn Cự',
    photo: doanVanCu,
    degree: 'Thạc sĩ',
    major: 'Khoa học máy tính',
  },
  {
    id: 'ho-vinh-hoa',
    name: 'Hồ Vĩnh Hoà',
    photo: hoVinhHoa,
    degree: 'Đại học',
    major: 'Kỹ thuật Nhiệt và Máy lạnh',
  },
  {
    id: 'le-thi-hong-nhung',
    name: 'Lê Thị Hồng Nhung',
    photo: leThiHongNhung,
    degree: 'Cử nhân',
    major: 'Quản lý tài nguyên và môi trường',
  },
  {
    id: 'nguyen-dang-hoai',
    name: 'Nguyễn Đăng Hoài',
    photo: nguyenDangHoai,
    degree: 'Cử nhân',
    major: 'Khoa học môi trường',
  },
]

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'business-registration',
    title: 'Giấy chứng nhận đăng ký kinh doanh của tổ chức khoa học và công nghệ',
    number: '4800000004',
    issuedBy: 'Phòng Doanh nghiệp và Đăng ký kinh doanh – Sở Tài chính thành phố Đà Nẵng',
    firstRegisteredAt: '2026-09-09',
  },
  {
    id: 'science-registration',
    title: 'Giấy chứng nhận đăng ký hoạt động khoa học và công nghệ',
    number: '3217/2026',
    issuedBy: 'Sở Khoa học và Công nghệ thành phố Đà Nẵng',
    firstRegisteredAt: '2026-08-13',
  },
]

export const PARTNERS = [
  'Petrolimex',
  'Đại học Đông Á',
  'Chi nhánh miền Trung – Trung tâm hành động quốc gia khắc phục hậu quả chất độc hoá học và môi trường (NACCET)',
  'Hiệp hội Doanh nghiệp thành phố Đà Nẵng',
  'Trung tâm Cấp cứu 115 – Sở Y tế thành phố Đà Nẵng',
  'Trạm Quan trắc – Cảnh báo môi trường độc – xạ miền Trung, Viện Hoá học Môi trường Quân sự',
  'Hội Doanh nghiệp phường An Khê',
  'Trung tâm UPSC tràn dầu miền Trung – Tổng công ty Sông Thu',
  'Trung tâm Bảo tồn đa dạng sinh học Nước Việt Xanh (GreenViet)',
]
