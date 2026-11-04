import { generatePlan, PlannerError } from '../../lib/question-planner.js';
import { readQuestion, reply, RequestError } from '../../lib/question-request.js';
import { reserveInference } from '../../lib/question-budget.js';
import { QuestionScheduleError } from '../../lib/question-schedule.js';

const model = '@cf/ibm-granite/granite-4.0-h-micro';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return reply({ error: 'Submit a question using POST.' }, 405, { Allow: 'POST' });
  try {
    const question = await readQuestion(request);
    const result = await generatePlan(question, async input => {
      if (!await reserveInference(env.USAGE)) throw new RequestError(429, 'The shared question limit has been reached. Try again later.');
      return env.AI.run(model, input);
    });
    return reply(result);
  } catch (error) {
    if (error instanceof RequestError) return reply({ error: error.message }, error.status);
    if (error instanceof QuestionScheduleError) return reply({ error: error.message }, 422);
    if (error instanceof PlannerError) {
      if (error.code === 'invalid_question') return reply({ error: error.message }, 400);
      if (error.code === 'unsupported_replacement') return reply({ error: error.message }, 422);
      if (error.code === 'no_match') return reply({ error: 'Could not match every activity. Try naming the items more specifically.' }, 422);
      return reply({ error: 'The suggested comparison was incomplete. Try rephrasing the question.' }, 422);
    }
    return reply({ error: 'Question search is temporarily unavailable.' }, 503);
  }
}
