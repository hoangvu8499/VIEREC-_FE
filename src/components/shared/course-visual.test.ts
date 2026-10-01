import { courseVisual } from '@/components/shared/course-visual'

describe('courseVisual', () => {
  it.each([
    ['Phòng cháy chữa cháy cơ bản', 'PCCC'],
    ['Kỹ năng thoát nạn khi cháy nhà cao tầng', 'PCCC'],
    ['Ứng phó sự cố hoá chất', 'An toàn hoá chất'],
    ['Ứng phó sự cố tràn dầu trên biển', 'Ứng phó sự cố'],
    ['An toàn điện cho công nhân vận hành', 'An toàn điện'],
    ['Sơ cấp cứu tại nơi làm việc', 'Sơ cấp cứu'],
    ['Pháp luật về bảo vệ môi trường 2020', 'Pháp lý'],
    ['Xử lý nước thải công nghiệp', 'Môi trường'],
    ['HSE cho quản lý cấp trung', 'An toàn lao động'],
    ['Kỹ năng mềm', 'Khoá học'],
  ])('%s → %s', (name, label) => {
    expect(courseVisual(name).label).toBe(label)
  })

  it('does not match inside other words', () => {
    // "đầu" trong "bắt đầu" không phải "tràn dầu".
    expect(courseVisual('Bắt đầu với Excel').label).toBe('Khoá học')
  })
})
