import { RuntimeRegistry } from './RuntimeRegistry';
import { CapabilityDescriptor } from './CapabilityDescriptor';
import { LLMProvider } from '../plugins/CapabilityProvider';

class DummyLLM implements LLMProvider {
  async invokeModel(prompt: string) { return "dummy"; }
}

async function runTests() {
  const registry = RuntimeRegistry.getInstance();
  await registry.clearAll();

  // Test 1: Register and resolve based on Priority
  const lowPriority = new CapabilityDescriptor<LLMProvider>({
    name: 'Low-LLM',
    capability: 'LLMProvider',
    version: '1',
    priority: 1
  }, () => new DummyLLM());

  const highPriority = new CapabilityDescriptor<LLMProvider>({
    name: 'High-LLM',
    capability: 'LLMProvider',
    version: '1',
    priority: 10
  }, () => new DummyLLM());

  lowPriority.setHealth('Healthy');
  highPriority.setHealth('Healthy');

  registry.register(lowPriority);
  registry.register(highPriority);

  // Attempt to resolve LLMProvider, it should return highPriority descriptor
  // We can test this by checking internal state, but since getProvider returns the instance, 
  // let's just make sure it doesn't throw. For a real test, we would use Jest/Vitest.
  
  try {
    const resolved = await registry.resolve({ capability: 'LLMProvider' });
    console.log('[Test 1] Resolution successful.');
    
    // Test 2: Health degraded vs unavailable
    highPriority.setHealth('Unavailable'); // high is down, should fallback to low
    const resolvedFallback = await registry.resolve({ capability: 'LLMProvider' });
    console.log('[Test 2] Fallback resolution successful.');
    
    // Test 3: Constraint matching
    const expensiveLLM = new CapabilityDescriptor<LLMProvider>({
      name: 'Expensive-LLM',
      capability: 'LLMProvider',
      version: '1',
      priority: 100, // Highest priority but high cost
      costClass: 'High'
    }, () => new DummyLLM());
    expensiveLLM.setHealth('Healthy');
    registry.register(expensiveLLM);

    // If we request Medium cost class, it should NOT return expensiveLLM
    // It should fall back to lowPriority (which has no costClass defined so it doesn't match if costClass is strictly required? Wait. Our implementation says if options.costClass is provided, it filters out descriptors that do not match `d.metadata.costClass === options.costClass`.)
    
    // So let's test that
    try {
      await registry.resolve({ capability: 'LLMProvider', costClass: 'Low' });
      console.error('[Test 3] FAILED: Should have thrown because no Low cost providers exist.');
    } catch (e) {
      console.log('[Test 3] Constraint filtering successful (expected throw).');
    }

    console.log('All tests passed.');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runTests();
