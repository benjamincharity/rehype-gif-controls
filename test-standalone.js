#!/usr/bin/env node

import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeGifControls from './lib/index.js';

async function testPlugin() {
  console.log('🧪 Testing rehype-gif-controls plugin...\n');

  const testHtml = `
    <div>
      <img src="test.gif" alt="Test GIF">
      <img src="regular.jpg" alt="Regular Image">
      <img src="animation.gif" alt="Animation" width="300" height="200">
    </div>
  `;

  try {
    const result = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeGifControls, {
        gifPlayer: {
          playCount: 2,
          clickToReplay: true,
        },
        injectScript: false, // Don't inject scripts in test
      })
      .use(rehypeStringify)
      .process(testHtml);

    console.log('✅ Plugin executed successfully!\n');
    console.log('📄 Original HTML:');
    console.log(testHtml.trim());
    console.log('\n📄 Processed HTML:');
    console.log(result.toString());

    // Check if GIFs were processed
    const output = result.toString();
    const gifControlsCount = (output.match(/data-gif-controls="true"/g) || [])
      .length;
    const wrapperCount = (output.match(/gif-controls-wrapper/g) || []).length;

    console.log('\n🔍 Results:');
    console.log(`- GIF controls added: ${gifControlsCount} (expected: 2)`);
    console.log(`- Wrapper elements: ${wrapperCount} (expected: 2)`);
    console.log(
      `- Regular image unchanged: ${output.includes('regular.jpg') && !output.includes('data-gif-controls') ? '✅' : '❌'}`
    );

    if (gifControlsCount === 2 && wrapperCount === 2) {
      console.log('\n🎉 All tests passed!');
      return true;
    } else {
      console.log('\n❌ Some tests failed!');
      return false;
    }
  } catch (error) {
    console.error('❌ Plugin test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

testPlugin().then((success) => {
  process.exit(success ? 0 : 1);
});
