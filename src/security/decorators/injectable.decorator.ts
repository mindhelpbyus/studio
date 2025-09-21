/**
 * @fileoverview Injectable Decorator
 * @description Dependency injection decorator for services
 * @compliance Clean Architecture, SOLID Principles
 */

export function Injectable() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Mark class as injectable for DI container
    Reflect.defineMetadata('injectable', true, constructor);
    return constructor;
  };
}