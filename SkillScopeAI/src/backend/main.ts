/* eslint-disable @typescript-eslint/no-explicit-any */
// main.ts
import util from 'util';
import { analyzeResumeGap } from './chat.js';

(async () => {
  try {
    const analysis = await analyzeResumeGap({
      jobTitle: 'McDonalds Cashier',
      jobDescription: `The McDonald’s cashier is responsible for verifying register receipts of daily transactions... (full JD text here)`,
      resumeText:
        'Detail-oriented computer science graduate with a solid background in front-end development creating dynamic and interactive user interfaces. Proficient in HTML5, CSS3, JavaScript, jQuery, and front-end frameworks such as Vue and React. Skilled in implementing responsive designs, accessibility standards, and SEO best practices. Excellent problem-solving abilities and a commitment to writing clean, scalable code. Skills Vue.js React.js HTML CSS/Sass JavaScript Git WordPress Webflow SEO best practices UX design principles Professional Experience Macroworks Front-End Development Intern, Ann Arbor, MI, May 20XX - August 20XX Developed and maintained responsive web applications using HTML, CSS, JavaScript, and Vue.js, improving site performance by 20% Collaborated with designers to implement new user interface features, enhancing user experience across multiple platforms Optimized website load times by 15% through code refactoring and asset optimization techniques Conducted thorough testing and debugging to ensure cross-browser compatibility and accessibility compliance Spin.io Software Engineering Intern | Detroit, MI | August 20XX – April 20XX Assisted in developing and maintaining a web-based application using React.js, contributing to a 25% reduction in bug reports Participated in code reviews, ensuring adherence to coding standards and best practices Collaborated with senior developers, gaining experience in Agile methodologies and project management tools Education University of British Columbia, B.S. in Computer Science Graduation Date: May 2024'
    });

    console.log(util.inspect(analysis, { depth: null, colors: true }));

  } catch (err) {
    console.error('Error analyzing resume:', (err as Error).message);
    if ((err as any).raw) {
      console.error('\nRaw model output:\n', (err as any).raw);
    }
    process.exit(1);
  }
})();