import { Router } from 'express';
import { ConflictError } from '../../errors/ConflictError';
import { NotFoundError } from '../../errors/NotFoundError';
import { ValidationError } from '../../errors/ValidationError';
import { AddressRepository } from '../../repositories/addressRepository';
import { validateAddressPayload } from '../../validators/addressValidator';

interface AddressRoutesOptions {
  addressRepository: AddressRepository;
}

function parseId(value: string, requestId?: string): number {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('Address id must be a positive integer', {
      requestId,
      context: {
        id: value,
      },
    });
  }

  return id;
}

export function createAddressRoutes(options: AddressRoutesOptions): Router {
  const { addressRepository } = options;

  const router = Router();

  router.get('/', async (req, res) => {
    const addresses = await addressRepository.findAll();

    res.status(200).json(addresses);
  });

  router.post('/', async (req, res) => {
    const addressData = validateAddressPayload(req.body, { requestId: req.requestId });

    if (await addressRepository.exists(addressData.chain, addressData.address)) {
      throw new ConflictError('Address already exists', {
        requestId: req.requestId,
        context: {
          chain: addressData.chain,
          address: addressData.address,
        },
      });
    }

    const address = await addressRepository.create(addressData);

    res.status(201).json(address);
  });

  router.get('/:id', async (req, res) => {
    const id = parseId(req.params.id, req.requestId);
    const address = await addressRepository.findById(id);

    if (!address) {
      throw new NotFoundError('Address not found', {
        requestId: req.requestId,
        context: {
          id,
        },
      });
    }

    res.status(200).json(address);
  });

  router.put('/:id', async (req, res) => {
    const id = parseId(req.params.id, req.requestId);
    const addressData = validateAddressPayload(req.body, { requestId: req.requestId });

    const updatedAddress = await addressRepository.update(id, addressData);

    if (!updatedAddress) {
      throw new NotFoundError('Address not found', {
        requestId: req.requestId,
        context: {
          id,
        },
      });
    }

    res.status(200).json(updatedAddress);
  });

  router.delete('/:id', async (req, res) => {
    const id = parseId(req.params.id, req.requestId);
    const isDeleted = await addressRepository.remove(id);

    if (!isDeleted) {
      throw new NotFoundError('Address not found', {
        requestId: req.requestId,
        context: {
          id,
        },
      });
    }

    res.status(204).send();
  });

  return router;
}
