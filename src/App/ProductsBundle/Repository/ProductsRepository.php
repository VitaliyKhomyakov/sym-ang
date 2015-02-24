<?php

namespace App\ProductsBundle\Repository;

use Doctrine\ORM\EntityRepository;

/*
 * Repository entity Products
 */
class ProductsRepository extends EntityRepository{

    /*
     * Returns the number of products
     *
     * @return int
     */
    public function getQuantityProducts() {

        return $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->getQuery()
            ->getSingleScalarResult();

    }
}