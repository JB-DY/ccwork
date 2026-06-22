import { test, expect, type APIRequestContext } from '@playwright/test';

const API = 'http://localhost:3001/notes';

// API로 사전 노트 생성 (UI가 아니라 직접 — 빠르고 격리됨)
async function seedNote(
  request: APIRequestContext,
  data: { title: string; content?: string; tags?: string[] },
) {
  const now = new Date().toISOString();
  const res = await request.post(API, {
    data: { content: '', tags: [], createdAt: now, updatedAt: now, ...data },
  });
  return (await res.json()) as { id: string };
}

test.describe('태그 기능 E2E', () => {
  const created: string[] = [];

  test.afterEach(async ({ request }) => {
    // 이 테스트가 만든 노트 정리 — db.json 오염 방지
    for (const id of created.splice(0)) {
      await request.delete(`${API}/${id}`);
    }
  });

  test('사용자가 노트에 태그를 추가·저장하면 새로고침 후에도 태그가 유지된다', async ({
    page,
    request,
  }) => {
    // Arrange: 태그 없는 노트를 API로 준비
    const note = await seedNote(request, {
      title: 'E2E 태그 추가 노트',
      content: '본문',
    });
    created.push(note.id);

    // Act: 앱 진입 → 노트 선택 → 태그 입력 후 Enter → 저장
    await page.goto('/');
    await page.getByRole('heading', { name: 'E2E 태그 추가 노트' }).click();

    const tagInput = page.getByPlaceholder('태그 추가');
    await tagInput.fill('playwright');
    await tagInput.press('Enter');
    // 칩이 화면에 떴는지(추가 동작 자체)는 가볍게 확인
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'playwright' })).toBeVisible();

    await page.getByRole('button', { name: '저장' }).click();

    // Assert: 새로고침해도 칩이 살아있다 = 실제 json-server에 영속됨
    //         (단위 테스트는 mock이라 절대 못 보는 지점)
    await page.reload();
    await page.getByRole('heading', { name: 'E2E 태그 추가 노트' }).click();
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'playwright' })).toBeVisible();
  });

  test('사용자가 기존 태그를 ×로 제거·저장하면 새로고침 후에도 제거 상태가 유지된다', async ({
    page,
    request,
  }) => {
    // Arrange: 태그 2개가 이미 달린 노트를 API로 준비
    const note = await seedNote(request, {
      title: 'E2E 태그 제거 노트',
      content: '본문',
      tags: ['keep', 'remove-me'],
    });
    created.push(note.id);

    // Act: 노트 선택 → 'remove-me' 칩의 × 버튼 클릭 → 저장
    await page.goto('/');
    await page.getByRole('heading', { name: 'E2E 태그 제거 노트' }).click();

    const removeChip = page.getByTestId('tag-chip').filter({ hasText: 'remove-me' });
    await expect(removeChip).toBeVisible();
    await removeChip.getByTestId('tag-chip-remove').click();
    await expect(removeChip).toBeHidden();

    await page.getByRole('button', { name: '저장' }).click();

    // Assert: 새로고침 후 제거된 태그는 사라지고 남긴 태그는 영속됨
    await page.reload();
    await page.getByRole('heading', { name: 'E2E 태그 제거 노트' }).click();
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'keep' })).toBeVisible();
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'remove-me' })).toHaveCount(0);
  });
});
