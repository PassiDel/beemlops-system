// TODO: add queue documentation (routing-keys, exchanges, payload types)
export interface Queues {
  exchanges: {
    'my-events': {
      'user.register': {
        req: {
          id: number;
        };
        res: void;
      };
    };
  };
}
